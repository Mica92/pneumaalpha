import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMaterial, type Material } from "@/lib/docente/docente.functions";
import { useI18n } from "@/lib/i18n";
import { emptyConfig, type BaseConfig } from "./config-fields";
import { usePreferences } from "./stage-e";

export type CreateSearch = { concept?: string; from?: string; conv?: string; sources?: string };

export function validateCreateSearch(s: Record<string, unknown>): CreateSearch {
  const concept = typeof s.concept === "string" ? s.concept.slice(0, 200) : undefined;
  const from = typeof s.from === "string" && /^[0-9a-f-]{36}$/i.test(s.from) ? s.from : undefined;
  const conv = from && typeof s.conv === "string" && /^[a-z_]{2,40}$/.test(s.conv) ? s.conv : undefined;
  const sources =
    typeof s.sources === "string" && /^[0-9a-f-]{36}(,[0-9a-f-]{36}){0,2}$/i.test(s.sources) ? s.sources : undefined;
  return { concept, from, conv, sources };
}

/** Form config prefilled from the dashboard concept or from a source material. */
export function useSeededConfig(search: CreateSearch) {
  const { lang } = useI18n();
  const [config, setConfig] = useState<BaseConfig>(() => emptyConfig(lang, { concept: search.concept }));
  const fetchMaterial = useServerFn(getMaterial);
  const source = useQuery({
    queryKey: ["docente-material", search.from],
    queryFn: () => fetchMaterial({ data: { id: search.from! } }) as Promise<Material>,
    enabled: Boolean(search.from),
  });
  useEffect(() => {
    const m = source.data;
    if (!m) return;
    const objective = typeof m.config?.objective === "string" ? (m.config.objective as string) : "";
    setConfig((c) => ({
      ...c,
      concept: m.concept || m.title,
      discipline: m.discipline,
      subject: m.subject,
      level: m.level || c.level,
      language: m.language,
      objective: c.objective || objective,
    }));
  }, [source.data]);
  // Teacher defaults (Preferences) fill only empty fields, and never when starting from a source material.
  const { data: prefs } = usePreferences();
  useEffect(() => {
    if (!prefs || search.from) return;
    setConfig((c) => ({
      ...c,
      discipline: c.discipline || prefs.default_discipline,
      level: prefs.default_level || c.level,
      language: prefs.default_language,
    }));
  }, [prefs, search.from]);
  return { config, setConfig, source: source.data ?? null, sourceLoading: source.isLoading && Boolean(search.from) };
}
