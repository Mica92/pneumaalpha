/**
 * Business model, client-safe.
 * Free tier: 12 lifetime messages, no full history, no report, no podcast.
 */
export const FREE_MESSAGE_LIMIT = 12;
export const LIFETIME_SEATS = 51;

export type PlanId = "monthly" | "semiannual" | "lifetime";

export type PlanDef = {
  id: PlanId;
  usd: number;
  clp: number;
  name: { es: string; en: string };
  tagline: { es: string; en: string };
  perks: { es: string[]; en: string[] };
  featured?: boolean;
  limited?: boolean;
};

const SHARED_PERKS = {
  es: [
    "Conversa con todos los filósofos, sin límite de mensajes",
    "Historial completo de tus conversaciones",
    "Reporte psicológico de tu pensamiento",
    "Podcast de los clásicos",
  ],
  en: [
    "Talk to every philosopher, with no message limit",
    "Full conversation history",
    "Psychological report of your thinking",
    "Podcast on the classics",
  ],
};

export const PLANS: PlanDef[] = [
  {
    id: "monthly",
    usd: 5.5,
    clp: 5000,
    name: { es: "Mensual", en: "Monthly" },
    tagline: { es: "Acceso completo, mes a mes.", en: "Full access, month by month." },
    perks: SHARED_PERKS,
  },
  {
    id: "semiannual",
    usd: 26,
    clp: 25000,
    name: { es: "Semestral", en: "Six months" },
    tagline: {
      es: "Seis meses de acceso: ahorras un mes.",
      en: "Six months of access: one month free.",
    },
    perks: {
      es: [...SHARED_PERKS.es, "Ahorras un mes respecto del plan mensual"],
      en: [...SHARED_PERKS.en, "You save one month versus the monthly plan"],
    },
    featured: true,
  },
  {
    id: "lifetime",
    usd: 36,
    clp: 35000,
    name: { es: "Vitalicio", en: "Lifetime" },
    tagline: {
      es: `Acceso para siempre. Solo las primeras ${LIFETIME_SEATS} personas.`,
      en: `Access forever. Only the first ${LIFETIME_SEATS} people.`,
    },
    perks: {
      es: [...SHARED_PERKS.es, "Un solo pago, acceso para siempre"],
      en: [...SHARED_PERKS.en, "One payment, access forever"],
    },
    limited: true,
  },
];

export function planById(id: string): PlanDef | undefined {
  return PLANS.find((p) => p.id === id);
}

export function formatUsd(value: number, lang: "es" | "en") {
  const n = Number.isInteger(value) ? value.toFixed(0) : value.toFixed(2);
  return lang === "es" ? `US$ ${n.replace(".", ",")}` : `US$ ${n}`;
}

export function formatClp(value: number) {
  return `$${value.toLocaleString("es-CL")} CLP`;
}

export type Entitlement = {
  active: boolean;
  plan: PlanId | null;
  currentPeriodEnd: string | null;
  freeMessagesUsed: number;
  freeMessagesLeft: number;
  lifetimeSeatsTaken: number;
  lifetimeSeatsLeft: number;
  checkoutConfigured: boolean;
};

export const PAYWALL_ERROR = "PNEUM_PAYWALL";
