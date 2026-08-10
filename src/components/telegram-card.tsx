import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/hooks/use-auth";
import { useI18n } from "@/lib/i18n";
import { createTelegramLinkCode, getTelegramLink, unlinkTelegram } from "@/lib/telegram.functions";

/**
 * Tarjeta para llevar PneumaA a Telegram: genera un código de vinculación
 * que el usuario escribe en el bot con /vincular.
 */
export function TelegramCard({ className = "", botUsername }: { className?: string; botUsername?: string }) {
  const { lang } = useI18n();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [code, setCode] = useState<string | null>(null);

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
    onSuccess: (data) => setCode(data.code),
  });

  const unlinkMutation = useMutation({
    mutationFn: () => unlink(),
    onSuccess: () => {
      setCode(null);
      queryClient.invalidateQueries({ queryKey: ["telegram-link"] });
    },
  });

  if (!user) return null;

  const es = lang === "es";
  const linked = linkQuery.data?.linked === true;

  return (
    <aside
      className={`rounded-lg border border-border/60 bg-card/40 px-5 py-4 ${className}`}
    >
      <p className="font-display text-[10px] uppercase tracking-[0.3em] text-foreground">
        {es ? "Conversar desde Telegram" : "Talk from Telegram"}
      </p>

      {linked ? (
        <>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {es
              ? "Tu cuenta está vinculada. Escribe al bot y el hilo se guarda aquí."
              : "Your account is linked. Write to the bot and the thread is saved here."}
          </p>
          <button
            type="button"
            onClick={() => unlinkMutation.mutate()}
            disabled={unlinkMutation.isPending}
            className="mt-3 rounded-md border border-border px-3 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
          >
            {es ? "Desvincular" : "Unlink"}
          </button>
        </>
      ) : (
        <>
          <p className="mt-1.5 text-xs text-muted-foreground">
            {es
              ? "Genera un código y escríbelo en el bot como «/vincular 123456»."
              : "Generate a code and send it to the bot as “/vincular 123456”."}
            {botUsername ? ` (${botUsername})` : ""}
          </p>
          {code ? (
            <p className="mt-3 font-display text-2xl tracking-[0.4em] text-foreground">{code}</p>
          ) : (
            <button
              type="button"
              onClick={() => codeMutation.mutate()}
              disabled={codeMutation.isPending}
              className="mt-3 rounded-md border border-mist/40 bg-mist/95 px-4 py-2 font-display text-[10px] uppercase tracking-[0.25em] text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {codeMutation.isPending
                ? es ? "Generando…" : "Generating…"
                : es ? "Generar código" : "Generate code"}
            </button>
          )}
          {codeMutation.isError && (
            <p className="mt-2 text-xs text-muted-foreground">
              {es ? "No se pudo generar el código." : "Could not generate the code."}
            </p>
          )}
        </>
      )}
    </aside>
  );
}
