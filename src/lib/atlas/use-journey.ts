import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listJourneyNodes,
  recordJourneyNode,
  removeJourneyNode,
  type JourneyNode,
} from "@/lib/atlas.functions";

/** Mapa filosófico personal, sincronizado con la cuenta. */
export function useJourney() {
  const qc = useQueryClient();
  const list = useServerFn(listJourneyNodes);
  const record = useServerFn(recordJourneyNode);
  const remove = useServerFn(removeJourneyNode);

  const query = useQuery<JourneyNode[]>({
    queryKey: ["journey-nodes"],
    queryFn: () => list(),
    staleTime: 30_000,
  });

  const addMutation = useMutation({
    mutationFn: (input: { entityId: string; entityKind: string; reason?: string }) =>
      record({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-nodes"] }),
  });

  const removeMutation = useMutation({
    mutationFn: (entityId: string) => remove({ data: { entityId } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["journey-nodes"] }),
  });

  const add = useCallback(
    (entityId: string, entityKind: string, reason?: string) =>
      addMutation.mutate({ entityId, entityKind, ...(reason ? { reason } : {}) }),
    [addMutation],
  );

  return {
    nodes: query.data ?? [],
    isLoading: query.isLoading,
    add,
    remove: removeMutation.mutate,
  };
}
