import { createId } from "~/lib/createId";
import { TinyBaseObjects } from "./useTinyBaseObjects";

export function createCard(tinyBaseObjects: TinyBaseObjects, data: {
  participantId: string;
  columnId: string;
  description: string;
}) {  
  const {store} = tinyBaseObjects;
  
  store.transaction(() => {
    const cardId = createId();

    store.setRow("cards", cardId, {
      authorId: data.participantId,
      columnId: data.columnId,
      createdAt: Date.now(),
      description: data.description,
    });

    const voteId = createId();
    store.setRow("votes", voteId, {
      cardId,
      voterId: data.participantId,
    });
  });
}
