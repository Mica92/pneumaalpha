import { PHILOSOPHER_LIST } from "@/lib/philosophers";

function fold(s: string) {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
}

/** Names of the thinkers registered in Kionas (the only authors generated material may cite). */
export const REGISTERED_THINKERS: string[] = PHILOSOPHER_LIST.filter((p) => p.id !== "rationalism").map((p) => p.name);

/** True when `text` names a registered thinker by full name or surname (whole word, accent-insensitive). */
export function mentionsRegistered(text: string, names: readonly string[] = REGISTERED_THINKERS): boolean {
  const t = ` ${fold(text).replace(/[^\p{L}\p{N}]+/gu, " ")} `;
  return names.some((n) => {
    const f = fold(n).replace(/[^\p{L}\p{N}]+/gu, " ").trim();
    if (!f) return false;
    const last = f.split(" ").pop()!;
    return t.includes(` ${f} `) || (last.length >= 3 && t.includes(` ${last} `));
  });
}

/** Keeps only reference lines that cite a registered thinker; headings and prose lines stay. */
export function filterBibliography(md: string, names: readonly string[] = REGISTERED_THINKERS): string {
  return md
    .split("\n")
    .filter((line) => {
      const isItem = /^\s*([-*+]|\d+[.)])\s+/.test(line);
      return !isItem || mentionsRegistered(line, names);
    })
    .join("\n")
    .trim();
}
