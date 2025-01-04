import { type ReactNode, useEffect, useRef, useState } from "react";
import { useValue } from "tinybase/ui-react";
import { Link, useParams, useRoute } from "wouter";
import { Button } from "~/components/Button";
import { Footer } from "~/components/Footer";
import { Icon } from "~/components/Icon";
import { Provider } from "~/components/Provider";
import { UiReact } from "~/lib/store";
import { useSortedCardIds } from "~/lib/useCardIds";

function formatTimeRemaining(timestamp: number) {
  const delta = Math.ceil((timestamp - Date.now()) / 1000);

  const m = Math.floor(delta / 60);
  const s = delta % 60;

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

type DisplayProps = {
  endingTimeStamp: number;
  running: boolean;
};

function Display({ endingTimeStamp, running }: DisplayProps) {
  const [formatedTimeLeft, setTimeLeft] = useState("")

  useEffect(() => {
    let updateTimerInterval: NodeJS.Timeout;

    if (running && endingTimeStamp > Date.now()) {
      setTimeLeft(formatTimeRemaining(endingTimeStamp));

      updateTimerInterval = setInterval(() => {
        setTimeLeft(formatTimeRemaining(endingTimeStamp));
      }, 1000);
    }

    return () => {
      clearInterval(updateTimerInterval);
    };
  }, [endingTimeStamp, running]);

  const handleNotifRequest = () => {
    Notification.requestPermission();
  };

  if (!running) {
    return (
      <button
        type="button"
        onClick={handleNotifRequest}
        className="font-mono text-lg text-white px-4 py-2 rounded-3xl bg-stone-400"
      >
        00:00
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleNotifRequest}
      className="font-mono text-lg text-white px-4 py-2 rounded-3xl bg-lime-600"
    >
      {formatedTimeLeft}
    </button>
  );
}

export function Timer() {
  const timer = UiReact.useValue('timer') || 0;
  const [timeRunning, setTimeRunning] = useState(timer > Date.now());

  const setTimerCallback = UiReact.useSetValueCallback("timer", (value: number) => value);
  const plus5min = () => setTimerCallback(Math.max(Date.now(), timer) + 5 * 5 * 1000)

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (timer > Date.now()) {
      setTimeRunning(true);

      timeout = setTimeout(() => {
        new Notification("Time is up!");
        setTimeRunning(false);

      }, timer - Date.now());
    } else {  
      setTimeRunning(false);
    }

    return () => {
      clearTimeout(timeout);
    }
  }, [timer]);

  return (
    <div className="flex items-center gap-3">
      <Button
        variant="negative"
        onClick={() => setTimerCallback(0)}
        disabled={!timeRunning}
      >
        Clear
      </Button>

      <Display endingTimeStamp={timer} running={timeRunning} />

      <Button onClick={plus5min} >
        +5 min.
      </Button>
    </div>
  );
}

function  Pagination() {
  const [presenting, params] = useRoute<{
    cardId: string;
  }>("/cards/:cardId");
  const [finished] = useRoute("/:boardId/finished");
  const cardIds = useSortedCardIds();
  const cardId = params?.cardId ?? "";
  const index = cardIds.indexOf(cardId);
  const hasPrev = index === 0;
  const hasNext = index === cardIds.length - 1;
  const prevIndex = Math.max(0, index - 1);
  const nextIndex = Math.min(cardIds.length - 1, index + 1);

  return (
    <div className="flex flex-grow items-center justify-end">
      {presenting || finished ? (
        <menu className="flex items-center gap-3">
          <li>
            <Button
              href={
                finished
                  ? `/cards/${cardIds[cardIds.length - 1]}`
                  : hasPrev
                    ? `/`
                    : `/cards/${cardIds[prevIndex]}`
              }
            >
              <Icon symbol="arrow-left" /> Back
            </Button>
          </li>
          <li>
            <Button
              href={
                hasNext
                  ? `/finished`
                  : `/cards/${cardIds[nextIndex]}`
              }
              disabled={finished}
            >
              Next <Icon symbol="arrow-right" />
            </Button>
          </li>
        </menu>
      ) : (
        <menu>
          <li>
            <Button
              href={`/cards/${cardIds[0]}`}
              disabled={cardIds.length === 0}
            >
              Start reading <Icon symbol="arrow-right" />
            </Button>
          </li>
        </menu>
      )}
    </div>
  );
}

function Audience() {
  const participantCount = UiReact.useValue("participants_count");

  return (
    <div
      className="flex items-center gap-1"
      aria-label={`${participantCount} people connected.`}
    >
      <Icon symbol="user-square" className="text-2xl" />×{participantCount}
    </div>
  );
}
type BoardProps = {
  children: ReactNode;
};

export function Board({ children }: BoardProps) {
  const {boardId} = useParams();
  if (!boardId) {
    throw new Error("No board ID found.");
  }

  return (
    <Provider boardId={boardId}>
      <div className="flex flex-col px-6 h-dvh">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-12 h-24">
            <div className="flex items-center flex-grow justify-between">
              <h1 className="text-2xl font-black">
                <Link href="~/">Hindsight</Link>
              </h1>

              <Audience />
            </div>

            <Timer />

            <Pagination />
          </div>

          <div className="overflow-auto grow">{children}</div>

          <Footer />
        </div>
    </Provider>
  );
}
