import { traditionById } from "@/lib/traditions";

export const DIALOGUE_HISTORY_LIMIT = 40;
export const TRADITION_PAGE_SIZE = 8;
export const MAX_CONTRAST_TRADITIONS = 3;

export function contrastSelection(id: string, otherIds?: string): string[] {
  return [...new Set([id, ...(otherIds?.split(",") ?? [])])]
    .filter((value) => traditionById(value) !== undefined)
    .slice(0, MAX_CONTRAST_TRADITIONS);
}

export function dialogueHistory<T>(messages: T[]): T[] {
  return messages.slice(-(DIALOGUE_HISTORY_LIMIT - 2));
}