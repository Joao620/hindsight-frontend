import { UiReact } from "./store";

export function useTinyBaseObjects() {
    const store = UiReact.useStore();
    if (!store) {
        throw new Error("Store is undefined");
    }
    
    const relationships = UiReact.useRelationships();
    if (!relationships) {
        throw new Error("Relationships is undefined");
    }

    const indexes = UiReact.useIndexes();
    if (!indexes) {
        throw new Error("Indexes is undefined");
    }

  return {
    store,
    relationships,
    indexes,
  };
}

export type TinyBaseObjects = ReturnType<typeof useTinyBaseObjects>;