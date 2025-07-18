import { useState } from "react";
import "./rainbow.css";
import { useRecordingState, AudioStates, AudioStateUnion } from "~/lib/useRecordingState";

type MicPopupProps = {
  className: string;
  writeTranscribedText: (text: string) => void;
};

export function MicPopup({ className, writeTranscribedText }: MicPopupProps) {
  const { recordingState, advanceState, resetErrorState } =
    useRecordingState(writeTranscribedText);

  const handleTipClick = () => {
    if (recordingState.kind === AudioStates.Error) {
        resetErrorState();
    }
  };

  const tipText = getTipText(recordingState);

  return (
    <div className={className}>
      <button onClick={advanceState}>
        {recordingState.kind !== AudioStates.Sending && recordingState.kind !== AudioStates.Polling ? (
          <AnimatedMicIcon
            recording={recordingState.kind === AudioStates.Hearing}
            blocked={recordingState.kind === AudioStates.Error}
          />
        ) : (
          <AnimatedCancelIcon />
        )}
      </button>
      {tipText.length !== 0 && (
        <p
          onClick={handleTipClick}
          className={`absolute bottom-0 left-10 px-2 py-1 rounded-xl
        flex justify-center items-center translate-y-1/4 max-w-[40ch] w-max z-10
        ${
          recordingState.kind === AudioStates.Error
            ? "bg-red-100 border border-red-400 text-red-700"
            : "bg-teal-100 border border-teal-400 text-teal-800"
        }`}
        >
          {tipText}
        </p>
      )}
    </div>
  );
}

function getTipText(state: AudioStateUnion) {
  switch (state.kind) {
    case AudioStates.Idle:
      return "";
    case AudioStates.Hearing:
    case AudioStates.Processing:
      return "You can speak now!";
    case AudioStates.Sending:
    case AudioStates.Polling:
      return "Waiting for transcription results...";
    case AudioStates.Canceling:
      return "Cancelling the request";
    case AudioStates.Error:
      return state.message;
    default:
      return "";
  }
}

type AnimatedMicIconProps = {
  recording: boolean;
  blocked: boolean;
};

function AnimatedMicIcon({ recording, blocked }: AnimatedMicIconProps) {
  const [isScaling, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (blocked) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 100); // Reset animation after 300ms
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      aria-label="microphone icon"
      aria-disabled={blocked}
      className={`
      inline-block size-[1em] text-[1.4rem]
      transition-all duration-100 in-out
      ${blocked ? "cursor-not-allowed" : ""}
      ${recording ? "rainbow-color" : ""}
      ${isScaling ? "scale-90" : "scale-100"}
    `}
      onClick={handleClick}
      // aria-hidden={label ? undefined : "true"}
      // aria-label={label}
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M9 2m0 3a3 3 0 0 1 3 -3h0a3 3 0 0 1 3 3v5a3 3 0 0 1 -3 3h0a3 3 0 0 1 -3 -3z" />
        <path d="M5 10a7 7 0 0 0 14 0" />
        <path d="M8 21l8 0" />
        <path d="M12 17l0 4" />
      </g>
    </svg>
  );
}

type AnimatedCancelIconProps = {};

function AnimatedCancelIcon({}: AnimatedCancelIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={`
      inline-block size-[1em] text-[1.4rem] rainbow-color transition-all
    `}
      // aria-hidden={label ? undefined : "true"}
      // aria-label={label}
    >
      <g
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
        <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
        <path d="M10 8l4 8" />
        <path d="M10 16l4 -8" />
      </g>
    </svg>
  );
}
