import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/hooks/use-auth";
import { getDocenteAccess, updateMaterial } from "./docente.functions";
import type { AccessState } from "./access";

export function useTr() {
  const { lang } = useI18n();
  return useCallback((es: string, en: string) => (lang === "es" ? es : en), [lang]);
}

export function useDocenteAccess() {
  const { user, loading } = useAuth();
  const fetchAccess = useServerFn(getDocenteAccess);
  return useQuery({
    queryKey: ["docente-access", user?.id ?? "none", user?.is_anonymous ?? true],
    queryFn: () => fetchAccess() as Promise<AccessState>,
    enabled: !loading && Boolean(user),
    retry: 1,
    staleTime: 60_000,
  });
}

export function errorText(err: unknown, lang: "es" | "en"): string {
  const msg = String((err as { message?: string })?.message ?? err ?? "");
  const es = lang === "es";
  if (msg.includes("AI_CREDITS"))
    return es
      ? "El servicio de IA no tiene créditos disponibles en este momento. El administrador debe recargarlos."
      : "The AI service has no credits available right now. The administrator needs to top them up.";
  if (msg.includes("AI_DAILY_LIMIT"))
    return es ? "Alcanzaste el límite diario de generaciones. Vuelve a intentarlo mañana." : "You reached today's generation limit. Try again tomorrow.";
  if (msg.includes("AI_RATE"))
    return es ? "Hay muchas solicitudes en curso. Espera un minuto e inténtalo de nuevo." : "Too many requests right now. Wait a minute and try again.";
  if (msg.includes("BAD_AI_OUTPUT"))
    return es ? "La respuesta de la IA llegó incompleta. Inténtalo de nuevo." : "The AI reply came back incomplete. Please try again.";
  if (msg.includes("AI_FAILED") || msg.includes("AI_NOT_CONFIGURED"))
    return es ? "No se pudo generar el contenido. Inténtalo de nuevo." : "The content could not be generated. Please try again.";
  if (msg.includes("FORBIDDEN"))
    return es ? "Tu cuenta no tiene acceso a esta acción." : "Your account does not have access to this action.";
  if (msg.includes("NOT_FOUND")) return es ? "No encontramos este material." : "We could not find this material.";
  if (msg.includes("CONTENT_TOO_LARGE"))
    return es ? "El documento es demasiado extenso para guardarse." : "The document is too long to be saved.";
  return es ? "Algo salió mal. Inténtalo de nuevo." : "Something went wrong. Please try again.";
}

export type SaveState = "saved" | "dirty" | "saving" | "error";

/**
 * Keeps a local draft of a material and saves it shortly after each change.
 * Never overwrites local edits with server data once editing has started.
 */
export function useAutosave<T extends Record<string, unknown>>(
  id: string,
  initial: { title: string; content: T },
) {
  const save = useServerFn(updateMaterial);
  const [title, setTitle] = useState(initial.title);
  const [content, setContent] = useState<T>(initial.content);
  const [state, setState] = useState<SaveState>("saved");
  const pending = useRef<{ title: string; content: T } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlight = useRef(false);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    const next = pending.current;
    if (!next || inFlight.current) return;
    inFlight.current = true;
    pending.current = null;
    setState("saving");
    try {
      await save({ data: { id, title: next.title, content: next.content } });
      setState(pending.current ? "dirty" : "saved");
    } catch {
      pending.current = pending.current ?? next;
      setState("error");
    } finally {
      inFlight.current = false;
      if (pending.current && timer.current === null) {
        timer.current = setTimeout(() => void flush(), 1200);
      }
    }
  }, [id, save]);

  const schedule = useCallback(
    (nextTitle: string, nextContent: T) => {
      pending.current = { title: nextTitle, content: nextContent };
      setState("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 1200);
    },
    [flush],
  );

  const updateContent = useCallback(
    (updater: T | ((prev: T) => T)) => {
      setContent((prev) => {
        const next = typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;
        schedule(titleRef.current, next);
        contentRef.current = next;
        return next;
      });
    },
    [schedule],
  );
  const titleRef = useRef(title);
  const contentRef = useRef(content);
  const updateTitle = useCallback(
    (t: string) => {
      titleRef.current = t;
      setTitle(t);
      schedule(t, contentRef.current);
    },
    [schedule],
  );

  /** Replaces local state without saving (e.g. after restoring a version on the server). */
  const reset = useCallback((t: string, c: T) => {
    titleRef.current = t;
    contentRef.current = c;
    pending.current = null;
    setTitle(t);
    setContent(c);
    setState("saved");
  }, []);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (pending.current || inFlight.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (pending.current) void flush();
    };
  }, [flush]);

  const retry = useCallback(() => {
    if (!pending.current) pending.current = { title: titleRef.current, content: contentRef.current };
    void flush();
  }, [flush]);

  return { title, content, state, setTitle: updateTitle, setContent: updateContent, reset, retry, flush };
}
