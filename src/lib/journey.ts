// Registro local del recorrido intelectual del usuario.
// Ligero y privado: vive en el navegador, no viaja al servidor.

import type { PhilosopherId } from "@/lib/philosophers";

const KEY = "pneuma.journey.v1";

export type JourneyEntry = {
  philosopher: PhilosopherId;
  count: number;
  last: number;
};

type JourneyState = {
  philosophers: Record<string, JourneyEntry>;
  ideas: string[];
  routes: string[];
};

const EMPTY: JourneyState = { philosophers: {}, ideas: [], routes: [] };

function read(): JourneyState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<JourneyState>;
    return {
      philosophers: parsed.philosophers ?? {},
      ideas: parsed.ideas ?? [],
      routes: parsed.routes ?? [],
    };
  } catch {
    return EMPTY;
  }
}

function write(state: JourneyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* almacenamiento no disponible */
  }
}

export function getJourney(): JourneyState {
  return read();
}

export function recordPhilosopher(id: PhilosopherId) {
  const s = read();
  const prev = s.philosophers[id];
  s.philosophers[id] = { philosopher: id, count: (prev?.count ?? 0) + 1, last: Date.now() };
  write(s);
}

export function recordIdea(id: string) {
  const s = read();
  if (!s.ideas.includes(id)) s.ideas.unshift(id);
  write(s);
}

export function recordRoute(id: string) {
  const s = read();
  if (!s.routes.includes(id)) s.routes.unshift(id);
  write(s);
}

export function journeyPhilosophers(): JourneyEntry[] {
  return Object.values(read().philosophers).sort((a, b) => b.last - a.last);
}
