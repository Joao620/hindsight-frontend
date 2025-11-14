import { createIndexes, createMergeableStore, createRelationships } from "tinybase/with-schemas";
import { UiReact, valuesSchema, tablesSchema } from "./store";

export function useCreateTinybase(boardId: string) {
    const store = UiReact.useCreateMergeableStore(() => {
        const createdStore = createMergeableStore()
            .setValuesSchema(valuesSchema)
            .setTablesSchema(tablesSchema);

        return createdStore
    }, [boardId])

    const relationships = UiReact.useCreateRelationships(store, (store) => {
        const relationships = createRelationships(store);

        relationships.setRelationshipDefinition(
            "cardsColumn",
            "cards",
            "columns",
            "columnId",
        );
        relationships.setRelationshipDefinition(
            "votesCard",
            "votes",
            "cards",
            "cardId",
        );

        return relationships;
    });

    const indexes = UiReact.useCreateIndexes(store, (store) => {
        const indexes = createIndexes(store);

        indexes.setIndexDefinition("votesByCardId", "votes", "cardId");
        indexes.setIndexDefinition("cardsByColumnId", "cards", "columnId");

        return indexes;
    });

    return { store, relationships, indexes };
}
