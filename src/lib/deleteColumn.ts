import type { Id } from "tinybase";
import { Index, Indexes, Store } from "tinybase/with-schemas";
import { deleteCard } from "~/lib/deleteCard";
import { Schema, UiReact } from "~/lib/store";
import { TinyBaseObjects } from "./useTinyBaseObjects";

export function deleteColumn(tinyBaseObjects: TinyBaseObjects, columnId: Id) {
  const {store, indexes} = tinyBaseObjects;
  
  store.transaction(() => {
    const cardIds = indexes.getSliceRowIds("cardsByColumnId", columnId);
    for (const cardId of cardIds) {
      deleteCard(tinyBaseObjects, cardId);
    }
    store.delRow("columns", columnId);
  });
}
