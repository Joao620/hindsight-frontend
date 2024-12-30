import type { Id } from "tinybase/with-schemas";
import { relationships } from "~/lib/store";
import { TinyBaseObjects } from "./useTinyBaseObjects";

export function deleteCard(tinyBaseObjects: TinyBaseObjects, cardId: Id) {
  const {store} = tinyBaseObjects;
  
  store.transaction(() => {
    const voteIds = relationships.getLocalRowIds("votesCard", cardId);
    for (const voteId of voteIds) {
      store.delRow("votes", voteId);
    }
    store.delRow("cards", cardId);
  });
}
