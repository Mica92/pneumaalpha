// Questions people write are private. They travel between screens through a
// short opaque id stored in sessionStorage, never inside the URL.

import { useEffect, useState } from "react";

const PREFIX = "pneum.q.";

export function stashQuestion(text: string): string | undefined {
  if (typeof window === "undefined") return undefined;
  const value = (text ?? "").trim();
  if (!value) return undefined;
  try {
    const id = Math.random().toString(36).slice(2, 10);
    window.sessionStorage.setItem(PREFIX + id, value);
    return id;
  } catch {
    return undefined;
  }
}

export function readQuestion(id?: string): string | undefined {
  if (typeof window === "undefined" || !id) return undefined;
  try {
    return window.sessionStorage.getItem(PREFIX + id) ?? undefined;
  } catch {
    return undefined;
  }
}

/** Search-param validator shared by every screen that receives a question. */
export function validateQid(search: Record<string, unknown>): { qid?: string } {
  return typeof search.qid === "string" && search.qid ? { qid: search.qid.slice(0, 16) } : {};
}

/** Stores the text once and returns the id to attach to a link. */
export function useQuestionHandoff(text: string | undefined): string | undefined {
  const [qid, setQid] = useState<string | undefined>(undefined);
  useEffect(() => {
    setQid(text && text.trim() ? stashQuestion(text) : undefined);
  }, [text]);
  return qid;
}
