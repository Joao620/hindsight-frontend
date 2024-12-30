import { useMemo } from "react";
import { getParticipantId } from "~/lib/participantId";
import { useVoteIdsByCardId } from "~/lib/useVoteIds";
import { useTinyBaseObjects } from "./useTinyBaseObjects";

export function useParticipantVoteId(cardId: string) {
  const { store } = useTinyBaseObjects()

  const participantId = getParticipantId();
  const voteIds = useVoteIdsByCardId(cardId);

  return useMemo(
    () =>
      voteIds.find((voteId) => {
        const voterId = store.getCell("votes", voteId, "voterId");
        return voterId === participantId;
      }),
    [voteIds, participantId],
  );
}
