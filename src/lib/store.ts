import * as UiReact from "tinybase/ui-react/with-schemas";
import {
  createIndexes,
  createMergeableStore,
  createMetrics,
  createQueries,
  createRelationships,
} from "tinybase/with-schemas";
import "ws";

export const valuesSchema = {
  timer: { type: "number" },
  participants_count: { type: "number", default: 0 },
} as const;

export const tablesSchema = {
  participants: {
    name: { type: "string", default: "Anonymous" },
  },
  columns: {
    createdAt: { type: "number", default: 0 },
    description: { type: "string", default: "" },
  },
  cards: {
    columnId: { type: "string", default: "" },
    authorId: { type: "string", default: "" },
    createdAt: { type: "number", default: 0 },
    description: { type: "string", default: "" },
  },
  votes: {
    cardId: { type: "string", default: "" },
    voterId: { type: "string", default: "" },
  },
} as const;

export type Schema = [typeof tablesSchema, typeof valuesSchema];

/**
 * @deprecated
 */
export const store = createMergeableStore()
  .setValuesSchema(valuesSchema)
  .setTablesSchema(tablesSchema);

// ---

const TypedUiReact = UiReact as UiReact.WithSchemas<Schema>;

export { TypedUiReact as UiReact };

// ---

export const queries = createQueries(store);

// ---

export const metrics = createMetrics(store);

// ---

export const relationships = createRelationships(store);

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

// ---

export const indexes = createIndexes(store);

indexes.setIndexDefinition("votesByCardId", "votes", "cardId");
indexes.setIndexDefinition("cardsByColumnId", "cards", "columnId");
