import { type ReactNode, useEffect, useState } from "react";
import { Link, useParams, useRoute } from "wouter";
import { Button } from "~/components/Button";
import { Footer } from "~/components/Footer";
import { Icon } from "~/components/Icon";
import { Provider } from "~/components/Provider";
import { UiReact } from "~/lib/store";
import { useSortedCardIds } from "~/lib/useCardIds";
import LoadingScreen from "./LoadingScreen";


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
  const [formatedTimeLeft, setTimeLeft] = useState("00:00");
  const [message, setMessage] = useState("");

  const messages = [
    "Stay focused! Every second counts.",
    "Deep work mode: Activated!",
    "Small steps lead to big results. Keep going!",
    "Time is your ally. Make the most of it!",
    "Break complex tasks into smaller, actionable steps.",
    "Avoid multitasking—single-tasking boosts efficiency!",
    "A clear mind leads to better decisions. Stay organized!",
    "Declutter your workspace, declutter your mind.",
    "Discipline > Motivation. Keep moving forward!",
    "Success is built in these moments of effort.",
  ];

  useEffect(() => {
    let updateTimerInterval: NodeJS.Timeout;
    let updateMessageInterval: NodeJS.Timeout;

    if (running && endingTimeStamp > Date.now()) {
      setTimeLeft(formatTimeRemaining(endingTimeStamp));
      setMessage(messages[Math.floor(Math.random() * messages.length)]);

      updateTimerInterval = setInterval(() => {
        setTimeLeft(formatTimeRemaining(endingTimeStamp));
      }, 1000);

      updateMessageInterval = setInterval(() => {
        setMessage(messages[Math.floor(Math.random() * messages.length)]);
      }, 10000);
    } else {
      setTimeLeft("00:00");
      setMessage("");
    }

    return () => {
      clearInterval(updateTimerInterval);
      clearInterval(updateMessageInterval);
    };
  }, [endingTimeStamp, running]);

  return (
    <>
      <div className="flex flex-col items-center">
        <button
          type="button"
          className="font-mono text-lg text-white px-4 py-2 rounded-3xl bg-lime-600"
        >
          {formatedTimeLeft}
        </button>
      </div>

      {message && (
        <div className="message-box fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg text-sm text-center">
          {message}
        </div>
      )}
    </>
  );
}



export function Timer() {
  const timer = UiReact.useValue("timer") || 0;
  const [timeRunning, setTimeRunning] = useState(timer > Date.now());
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [volume, setVolume] = useState(0.5);
  const [audio] = useState(() => new Audio("/alarm.mp3")); // Criar o áudio apenas uma vez

  const setTimerCallback = UiReact.useSetValueCallback("timer", (value: number) => value);
  const plus1min = () => setTimerCallback(Math.max(Date.now(), timer) + 1 * 60 * 1000);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (timer > Date.now()) {
      setTimeRunning(true);
      timeout = setTimeout(() => {
        new Notification("Time is up!");
        
        if (isSoundEnabled) {
          audio.volume = volume;
          audio.play();
        }
        
        setTimeRunning(false);
      }, timer - Date.now());
    } else {
      setTimeRunning(false);
    }

    return () => clearTimeout(timeout);
  }, [timer, isSoundEnabled, volume, audio]);

  // Atualizar volume sempre que for alterado
  useEffect(() => {
    audio.volume = volume;
  }, [volume, audio]);

  // Função para pausar o som e zerar o volume quando o botão for desativado
  useEffect(() => {
    if (!isSoundEnabled) {
      audio.pause();
      audio.currentTime = 0;
      setVolume(0); // Zera o volume quando o som é desativado
    }
  }, [isSoundEnabled, audio]);


  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <Button
          variant="negative"
          onClick={() => {
            setTimerCallback(0);
            setTimeRunning(false);
            audio.pause();
            audio.currentTime = 0; // Reiniciar o som ao limpar o timer
          }}
          disabled={!timeRunning}
        >
          Clear
        </Button>

        <Display endingTimeStamp={timer} running={timeRunning} />

        <Button onClick={plus1min}>+1 min.</Button>
      </div>

      {/* Botões de controle de som */}
      <div className="flex items-center gap-3 mt-2">
        <Button onClick={() => setIsSoundEnabled(!isSoundEnabled)}>
          {isSoundEnabled ? "🔊" : "🔇"}
        </Button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          className="w-24 cursor-pointer"
        />
      </div>
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



export function Board({ children }) {
  const { boardId } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simula o carregamento por 3 segundos antes de exibir o board
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 15000);

    return () => clearTimeout(timeout);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Provider boardId={boardId}>
      <div className="flex flex-col px-6 h-dvh">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-12 h-24">
          <div className="flex items-center flex-grow justify-between">
            <h1 className="text-2xl font-black">
              <Link href="~/">Hindsight</Link>
            </h1>
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
