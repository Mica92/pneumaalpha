// Privacy-preserving topic classification. Runs in the browser; only the
// resulting category label is sent to analytics — never the question text.
export type ThemeCategory =
  | "existencia" | "etica" | "politica" | "sentido" | "amor"
  | "muerte" | "trabajo" | "conocimiento" | "religion" | "libertad"
  | "identidad" | "sufrimiento" | "otro";

const RULES: [ThemeCategory, RegExp][] = [
  ["muerte", /\b(muerte|morir|muero|duelo|finitud|death|dying|grief|mortal)/i],
  ["sufrimiento", /\b(sufr|dolor|ansiedad|angustia|tristeza|depres|miedo|suffer|pain|anxiety|fear|sad)/i],
  ["amor", /\b(amor|amar|pareja|relaci[oó]n|amistad|soledad|love|partner|friend|lonel)/i],
  ["trabajo", /\b(trabajo|carrera|empleo|dinero|empresa|[eé]xito|work|career|job|money|success)/i],
  ["politica", /\b(pol[ií]tic|estado|gobierno|poder|democracia|justicia social|capitalis|socialis|politic|government|power|democra)/i],
  ["etica", /\b([eé]tic|moral|bien|mal|deber|virtud|justo|ethic|good|evil|duty|virtue|right|wrong)/i],
  ["religion", /\b(dios|fe|religi|esp[ií]ritu|alma|god|faith|soul|spirit)/i],
  ["libertad", /\b(libertad|libre|elegir|elecci[oó]n|freedom|free|choice|choose)/i],
  ["identidad", /\b(qui[eé]n soy|identidad|yo mismo|autenticidad|who am i|identity|self|authentic)/i],
  ["conocimiento", /\b(verdad|conocer|saber|raz[oó]n|ciencia|realidad|truth|know|reason|science|reality)/i],
  ["sentido", /\b(sentido|prop[oó]sito|vida|felicidad|vivir|meaning|purpose|life|happiness|live)/i],
  ["existencia", /\b(existencia|existir|ser|nada|absurdo|exist|being|nothing|absurd)/i],
];

export function classifyTheme(text: string): ThemeCategory {
  for (const [cat, re] of RULES) if (re.test(text)) return cat;
  return "otro";
}
