import { Reducer, useEffect, useRef, useState } from "react";
import "./rainbow.css";

type MicPopupProps = {
  className: string;
};

export function MicPopup({ className }: MicPopupProps) {
  const [recordingState, setRecordingState] = useState<AudioStateUnion>({
    kind: AudioStates.Idle,
  });
  const micAnimated = recordingState.kind === AudioStates.Hearing;

  const tipText = getTipText(recordingState);

  const handleMicClick = (event: React.MouseEvent<HTMLElement>) => {
    switch (recordingState.kind) {
      case AudioStates.Idle:
        const stopAudio = micRecorder();
        setRecordingState({ kind: AudioStates.Hearing, stopRecord: stopAudio });
        break;
      case AudioStates.Hearing:
        setRecordingState({ kind: AudioStates.Processing });
        recordingState
          .stopRecord()
          .then((audioBlob) => {
            setRecordingState({
              kind: AudioStates.Sending,
              audioData: audioBlob,
            });
          })
          .catch((err) => {
            const message =
              err instanceof Error
                ? err.message
                : "unknown error. This should not be happening";
            const timeoutId = setTimeout(() => {
              setRecordingState({ kind: AudioStates.Idle });
            }, 5000);
            setRecordingState({
              kind: AudioStates.Error,
              message,
              removeTipTimeout: timeoutId,
            });
          });
        break;
    }
  };

  const handleTipClick = () => {
    if (recordingState.kind === AudioStates.Error) {
      recordingState.removeTipTimeout &&
        clearTimeout(recordingState.removeTipTimeout);

      const timeoutId = setTimeout(() => {
        setRecordingState({ kind: AudioStates.Idle });
      }, 5000);

      setRecordingState({
        kind: AudioStates.Error,
        message: recordingState.message,
        removeTipTimeout: timeoutId,
      });
    }
  };
    return (
    <div className={className}>
      <button onClick={handleMicClick}>
        { recordingState.kind !== AudioStates.Sending
          ? <AnimatedMicIcon
              recording={micAnimated}
              blocked={recordingState.kind === AudioStates.Error}
            />
          : <AnimatedCancelIcon />
          }
      </button>
      {tipText.length !== 0 && (
        <p
          onClick={handleTipClick}
          className={`absolute bottom-0 left-10 px-2 py-1 rounded-xl
        flex justify-center items-center translate-y-1/4 max-w-[40ch] w-max z-10
        ${recordingState.kind === AudioStates.Error
          ? "bg-red-100 border border-red-400 text-red-700"
          : "bg-teal-100 border border-teal-400 text-teal-800" }`}
        >
          {tipText}
        </p>
      )}
    </div>
  );
}

enum AudioStates {
  Idle,
  Hearing,
  Processing,
  Sending,
  Canceling,
  Error,
}

type AudioStateUnion =
  | { kind: AudioStates.Idle }
  | { kind: AudioStates.Hearing; stopRecord: ReturnType<typeof micRecorder> }
  | { kind: AudioStates.Processing }
  | { kind: AudioStates.Sending; audioData: Blob }
  | {
      kind: AudioStates.Error;
      message: string;
      removeTipTimeout: ReturnType<typeof setTimeout>;
    }
  | { kind: AudioStates.Canceling };

function micRecorder() {
  const audioChunks: Blob[] = [];

  const mediaRecorderPromise = navigator.mediaDevices
    .getUserMedia({ audio: true })
    .then((newStream) => {
      const mediaRecorder = new MediaRecorder(newStream, {
        mimeType: getSupportedAudioMimeType(),
      });
      mediaRecorder.start();

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      return { mediaRecorder, newStream };
    })

  return async function stopRecord() {
    try {
      const recordingThingy = await mediaRecorderPromise;
      return new Promise<Blob>((resolve) => {
        recordingThingy.mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, {
            type: getSupportedAudioMimeType(),
          });
          resolve(audioBlob);
        };

        recordingThingy.mediaRecorder.stop();
        recordingThingy.newStream.getTracks().forEach((track) => track.stop());
      });
    } catch (err) {
      if (!(err instanceof DOMException)) {
        throw new Error("Unknow exception");
      }
      switch (err.name) {
        case "AbortError":
          throw new Error("The operation was cancelled. Please try again.");
        case "InvalidStateError":
          throw new Error(
            "The current page is not fully loaded. Please refresh and try again.",
          );
        case "NotAllowedError":
          throw new Error(
            "Permission to access the microphone was denied. Please check your browser settings and try again.",
          );
        case "NotFoundError":
        case "DevicesNotFoundError":
          throw new Error(
            "No media device found. Please ensure your microphone is connected and enabled.",
          );
        case "NotReadableError":
        case "TrackStartError":
          throw new Error(
            "The microphone is currently in use by another application. Please close the other application and try again.",
          );
        case "SecurityError":
          throw new Error(
            "Access to the microphone is disabled. Please enable it in your browser settings and try again.",
          );
        case "PermissionDismissedError":
          throw new Error(
            "You dismissed the permission request. Please allow access to continue.",
          );
        case "TypeError":
          throw new Error(
            "Invalid request. Please ensure at least one audio or video input is requested.",
          );
        default:
          throw new Error(`An unexpected error occurred: ${err.message}`);
      }
    }
  };
}

let cachedSupportedAudioMimeType: string | null = null;
function getSupportedAudioMimeType() {
  if (cachedSupportedAudioMimeType) return cachedSupportedAudioMimeType;

  const AUDIO_TYPES = ["webm", "mp3", "mp4", "x-matroska", "ogg", "wav"];
  const AUDIO_CODECS = ["opus", "vorbis", "aac", "mpeg", "mp4a", "pcm"];

  for (const audioType of AUDIO_TYPES) {
    for (const audioCodec of AUDIO_CODECS) {
      const mimeString = `audio/${audioType};codecs=${audioCodec}`;
      if (MediaRecorder.isTypeSupported(mimeString)) {
        cachedSupportedAudioMimeType = mimeString;
        return mimeString;
      }
    }
  }
}

function getTipText(state: AudioStateUnion) {
  switch (state.kind) {
    case AudioStates.Idle:
      return "";
    case AudioStates.Hearing:
    case AudioStates.Processing:
      return "You can speak now!";
    case AudioStates.Sending:
      return "Processing your audio..."
    case AudioStates.Canceling:
      return "Cancelling the request";
    case AudioStates.Error:
      return state.message;
    default:
      return "";
  }
}

type AnimatedMicIconProps = {
  recording: boolean
  blocked: boolean
};

function AnimatedMicIcon({ recording, blocked }: AnimatedMicIconProps) {
  const [isScaling, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (blocked) return
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

type AnimatedCancelIconProps = {
};

function AnimatedCancelIcon({ }: AnimatedCancelIconProps) {
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
