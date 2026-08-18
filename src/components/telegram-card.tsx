import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import QRCode from "qrcode";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { createTelegramLinkCode, getTelegramLink, unlinkTelegram } from "@/lib/telegram.functions";

/**
 * Tarjeta para llevar PneumaA a Telegram: explica el flujo y genera
 * un código de vinculación. El usuario puede escanear el QR o escribir
 * /vincular seguido del código.
 */
export function TelegramCard({ className = "" }: { className?: string }) {
  const { t } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState<string | null>(null);
  const [deepLink, setDeepLink] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrVisible, setQrVisible] = useState(false);


  const fetchLink = useServerFn(getTelegramLink);
  const createCode = useServerFn(createTelegramLinkCode);
  const unlink = useServerFn(unlinkTelegram);

  const linkQuery = useQuery({
    queryKey: ["telegram-link"],
    queryFn: () => fetchLink(),
    enabled: Boolean(user),
  });

  const codeMutation = useMutation({
    mutationFn: () => createCode(),
    onSuccess: (data) => {
      setCode(data.code);
      setDeepLink(data.deepLink ?? null);
      setQrVisible(false);
      setQrDataUrl(null);
    },
  });


  const unlinkMutation = useMutation({
    mutationFn: () => unlink(),
    onSuccess: () => {
      setCode(null);
      setDeepLink(null);
      setQrDataUrl(null);
      setQrVisible(false);
      queryClient.invalidateQueries({ queryKey: ["telegram-link"] });
    },
  });


  useEffect(() => {
    if (!deepLink || !qrVisible) {
      if (!qrVisible) setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    QRCode.toDataURL(deepLink, {
      width: 180,
      margin: 1,
      color: { dark: "#a8b8c2", light: "#0b0f12" },
      errorCorrectionLevel: "M",
    }).then((url) => {
      if (!cancelled) setQrDataUrl(url);
    });
    return () => { cancelled = true; };
  }, [deepLink, qrVisible]);


  if (!user) return null;

  const linked = linkQuery.data?.linked === true;

  return (
    <aside
      className={`rounded-lg border border-border/60 bg-card/40 px-5 py-4 ${className}`}
    >
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-foreground">
        {t("telegram.title")}
      </p>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        {t("telegram.what")}
      </p>

      {linked ? (
        <div className="mt-4 space-y-3">
          <p className="text-xs leading-relaxed text-foreground/90">
            {t("telegram.linked")}
          </p>
          <button
            type="button"
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
            className="rounded-md border border-border px-3 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {t("telegram.unlink")}
          </button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <ol className="list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-muted-foreground">
            <li>{t("telegram.step1")}</li>
            <li>{t("telegram.step2")}</li>
            <li>{t("telegram.step3")}</li>
          </ol>

          {code ? (
            <div className="space-y-3 rounded-md border border-mist/40 bg-mist/10 p-4">
              {qrDataUrl && (
                <div className="flex flex-col items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt={t("telegram.qrAlt")}
                    width={180}
                    height={180}
                    className="rounded-md border border-border/50"
                  />
                  <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">
                    {t("telegram.qrHint")}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between gap-3 rounded-md border border-border/50 bg-background/30 px-4 py-3">
                <span className="font-display text-2xl tracking-[0.4em] text-foreground">
                  {code}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  /vincular
                </span>
              </div>

              {deepLink && (
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-center text-xs text-mist underline underline-offset-2 transition-opacity hover:opacity-80"
                >
                  {t("telegram.openTelegram")}
                </a>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => codeMutation.mutate()}
              disabled={codeMutation.isPending}
              className="rounded-md border border-mist/40 bg-mist/95 px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {codeMutation.isPending ? t("telegram.generating") : t("telegram.generate")}
            </button>
          )}

          <div className="rounded-md border border-border/50 bg-background/30 px-3 py-2.5">
            <p className="font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              {t("telegram.commands")}
            </p>
            <p className="mt-1 font-mono text-xs text-foreground/80">
              {t("telegram.commandsList")}
            </p>
          </div>

          <p className="text-[10px] leading-relaxed text-muted-foreground/80">
            {t("telegram.freeMinds")}
          </p>

          {codeMutation.isError && (
            <p className="text-xs text-muted-foreground">{t("telegram.codeError")}</p>
          )}
        </div>
      )}
    </aside>
  );
}
