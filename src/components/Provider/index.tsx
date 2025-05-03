import { type ReactNode, useEffect, useState } from "react";
import { createLocalPersister } from "tinybase/persisters/persister-browser/with-schemas";
import { createWsSynchronizer } from "tinybase/synchronizers/synchronizer-ws-client/with-schemas";
import { getParticipantId } from "~/lib/participantId";
import { UiReact } from "~/lib/store";
import { useWebSocket } from "~/lib/useWebSocket";
import { SERVER_URL, WEBSOCKET_PROTOCOL } from "~/contants";

import { useCreateTinybase } from "~/lib/useCreateTinybase";
import { Link } from "wouter";

type Props = {
  boardId: string;
  children: ReactNode;
};

export function Provider({ boardId, children }: Props) {
  const [takingLongTime, setTakingLongTime] = useState(false);
  const [webSocketError, setWebSocketError] = useState<Boolean>(false);

  const {store, relationships, indexes} = useCreateTinybase();

  const syncronizer = UiReact.useCreateSynchronizer(
    store,
    async (store) => {

      const webSocket = new WebSocket(`${WEBSOCKET_PROTOCOL}://${SERVER_URL}/room/${boardId}`)

      try {
        await new Promise<void>((resolve, reject) => {
          webSocket.onopen = () => resolve();
          webSocket.onerror = (error) => reject(error);
        });
      } catch (error) {
        setWebSocketError(true);
        console.log('An error occured', webSocket, error);
        return;
      }

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

  if (webSocketError) {
    return (
      <div className="flex items-center flex-col justify-center">
        <div className="text-lg text-red-600 font-bold text-center">
          An error occurred while connecting to the server.
          <br/>
          If the issue persists, please send an email.
          <br/>
          <a href="mailto:support@hindsight-for.teams" className="text-blue-600 underline">support@hindsight-for.teams</a>
        </div>
        <br/>
        <div className="text-lg text-red-600 font-bold text-center">
          <Link href="~/" className="text-blue-600 underline">Go back to the home page</Link>
        </div>
      </div>
    )
  }

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
