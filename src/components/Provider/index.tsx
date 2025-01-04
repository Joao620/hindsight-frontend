import { type ReactNode, useEffect, useState } from "react";
import { createLocalPersister } from "tinybase/persisters/persister-browser/with-schemas";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import { getParticipantId } from "~/lib/participantId";
import { UiReact } from "~/lib/store";
import { useWebSocket } from "~/lib/useWebSocket";
import { SERVER_URL, WEBSOCKET_PROTOCOL } from "~/contants";

import { useCreateTinybase } from "~/lib/useCreateTinybase";

type Props = {
  boardId: string;
  children: ReactNode;
};

export function Provider({ boardId, children }: Props) {
  const [takingLongTime, setTakingLongTime] = useState(false);

  const {store, relationships, indexes} = useCreateTinybase();
 
  const syncronizer = UiReact.useCreateSynchronizer(
    store,
    async (store) => {      
      const webSocket = new WebSocket(`${WEBSOCKET_PROTOCOL}://${SERVER_URL}/${boardId}`)

      const synchronizer = await createWsSynchronizer(store, webSocket);
      await synchronizer.startSync();
      return synchronizer;
    },
    [boardId],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if(!syncronizer)
        setTakingLongTime(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, [syncronizer]);
  
  UiReact.useCreatePersister(
    store,
    (store) => createLocalPersister(store, boardId),
    [boardId],
    async (persister) => {
      await persister.startAutoLoad();
      await persister.startAutoSave();
    },
  );

  if (takingLongTime && !syncronizer) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-lg text-gray-500 text-center">The server is starting up. <br/> This should take no more than 10 seconds.</div>
      </div>
    )
  }

  if(!syncronizer) {
    return null;
  }

  return (
    <UiReact.Provider
      store={store}
      relationships={relationships}
      indexes={indexes}
    >
      {children}
    </UiReact.Provider>
  );
}
