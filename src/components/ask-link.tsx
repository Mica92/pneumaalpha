import { useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { stashQuestion } from "@/lib/question-handoff";

/**
 * Carries a question to another surface without ever putting its text in the
 * URL: the text is stashed in this browser's session and only an opaque id
 * travels.
 */
export function AskLink({
  text,
  to,
  params,
  extraSearch,
  className,
  children,
  onNavigate,
}: {
  text: string;
  to: string;
  params?: Record<string, string>;
  extraSearch?: Record<string, string>;
  className?: string;
  children: ReactNode;
  onNavigate?: () => void;
}) {
  const navigate = useNavigate();
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onNavigate?.();
        const qid = stashQuestion(text);
        navigate({
          to,
          params,
          search: { ...(qid ? { qid } : {}), ...(extraSearch ?? {}) },
        } as never);
      }}
    >
      {children}
    </button>
  );
}
