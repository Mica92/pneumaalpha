import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SITE_URL } from "@/lib/site";
import { useI18n } from "@/lib/i18n";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { TraditionBrowser } from "@/components/tradition-browser";

type Mode = "dialogar" | "contrastar" | "confrontar";

const MODES: { key: Mode; es: string; en: string }[] = [
  { key: "dialogar", es: "Dialogar", en: "Converse" },
  { key: "contrastar", es: "Contrastar", en: "Compare" },
  { key: "confrontar", es: "Confrontar", en: "Confront" },
];

export const Route = createFileRoute("/_authenticated/dialogos/")({
  component: DialogosIndex,
  head: () => ({
    meta: [
      { title: "Diálogos filosóficos — Kionas" },
      {
        name: "description",
        content:
          "Investiga una pregunta desde distintas tradiciones filosóficas: dialogar con una corriente, contrastar dos o tres, o confrontar una tesis. Cada una razona con sus propios conceptos, premisas y método.",
      },
      { property: "og:title", content: "Diálogos filosóficos — Kionas" },
      {
        property: "og:description",
        content: "Una pregunta, muchas formas de pensar: tradiciones filosóficas que razonan desde sus propios conceptos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: `${SITE_URL}/dialogos` },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: `${SITE_URL}/dialogos` }],
  }),
});

function DialogosIndex() {
  const { lang } = useI18n();
  const es = lang === "es";
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("dialogar");
  const [picks, setPicks] = useState<string[]>([]);

  const togglePick = (id: string) =>
    setPicks((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : prev.length >= 3 ? prev : [...prev, id],
    );

  const open = (id: string) => {
    navigate({ to: "/dialogos/$id", params: { id }, search: { mode } });
  };

  const runContrast = () => {
    if (picks.length < 2) return;
    const [first, ...others] = picks;
    navigate({
      to: "/dialogos/$id",
      params: { id: first },
      search: { mode: "contrastar", with: others.join(",") },
    });
  };

  return (
    <>
      <SiteNav />
      <main className="route-enter relative z-10 mx-auto max-w-4xl px-5 pb-24 pt-16 md:px-8 md:pt-24">
        <p className="label">{es ? "Diálogos filosóficos" : "Philosophical dialogues"}</p>
        <h1 className="mt-3 max-w-2xl font-serif text-display font-light text-foreground">
          {es ? "Una pregunta, muchas formas de pensar" : "One question, many ways of thinking"}
        </h1>

        <div
          className="mt-7 inline-flex items-center rounded-full border border-border/70 p-0.5 backdrop-blur-md"
          role="group"
          aria-label={es ? "Modo" : "Mode"}
        >
          {MODES.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setMode(m.key);
                setPicks([]);
              }}
              aria-pressed={mode === m.key}
              className={`focus-mist rounded-full px-4 py-1.5 text-micro transition-colors ${
                mode === m.key ? "bg-bronze/15 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {m[lang]}
            </button>
          ))}
        </div>

        <p className="mt-3 text-micro text-muted-foreground">
          {mode === "contrastar"
            ? es
              ? "Elige dos o tres corrientes para contrastarlas sobre una misma pregunta."
              : "Pick two or three traditions to compare them on one question."
            : es
              ? "Elige una corriente para empezar."
              : "Pick a tradition to begin."}
        </p>

        <div className="mt-8">
          <TraditionBrowser
            mode={mode === "contrastar" ? "multi" : "single"}
            selected={picks}
            onToggle={togglePick}
            onOpen={open}
            maxSelect={3}
          />
        </div>

        {mode === "contrastar" && (
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <p className="text-micro text-muted-foreground">
              {picks.length}/3 {es ? "seleccionadas" : "selected"}
            </p>
            <button
              type="button"
              onClick={runContrast}
              disabled={picks.length < 2}
              className="btn-gold focus-mist px-6 py-2.5 text-small disabled:cursor-not-allowed disabled:opacity-40"
            >
              {es
                ? picks.length >= 2
                  ? `Contrastar ${picks.length} corrientes →`
                  : "Contrastar →"
                : picks.length >= 2
                  ? `Compare ${picks.length} traditions →`
                  : "Compare →"}
            </button>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
