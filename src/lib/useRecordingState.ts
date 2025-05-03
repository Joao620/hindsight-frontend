import { useState, useCallback } from "react";
import { micRecorder } from "~/lib/audioUtils"; // Assume audioUtils.ts contains micRecorder and getSupportedAudioMimeType
import { HTTP_PROTOCOL, SERVER_URL } from "~/contants";

const ERROR_TIP_TIME_MS = 5000;

export enum AudioStates {
  Idle,
  Hearing,
  Processing,
  Sending,
  Canceling,
  Error,
}

export type AudioStateUnion =
  | { kind: AudioStates.Idle }
  | { kind: AudioStates.Hearing; stopRecord: ReturnType<typeof micRecorder> }
  | { kind: AudioStates.Processing }
  | {
      kind: AudioStates.Sending;
      audioData: Blob;
      abortControl: AbortController;
    }
  | {
      kind: AudioStates.Error;
      message: string;
      removeTipTimeout?: ReturnType<typeof setTimeout>;
    }
  | { kind: AudioStates.Canceling };

export function useRecordingState(
  writeTranscribedText: (text: string) => void,
) {
  const [recordingState, setRecordingState] = useState<AudioStateUnion>({
    kind: AudioStates.Idle,
  });

  const advanceState = () => {
    if (recordingState.kind === AudioStates.Idle) {
      startRecording();
    } else if (recordingState.kind === AudioStates.Hearing) {
      stopRecording();
    } else if (recordingState.kind === AudioStates.Sending) {
      recordingState.abortControl.abort();
      putInErrorState("The transcribe request was cancelled", setRecordingState)
    }
  };

  const startRecording = () => {
    const stopAudio = micRecorder();
    setRecordingState({
      kind: AudioStates.Hearing,
      stopRecord: stopAudio,
    });
  };

  const stopRecording = useCallback(async () => {
    if (recordingState.kind === AudioStates.Hearing) {
      setRecordingState({ kind: AudioStates.Processing });
      try {
        const audioBlob = await recordingState.stopRecord();
        const abortC = new AbortController();
        setRecordingState({
          kind: AudioStates.Sending,
          audioData: audioBlob,
          abortControl: abortC,
        });
        await sendAudioToServer(audioBlob, abortC);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "unknown error. This should not be happening";

        fetch(`${HTTP_PROTOCOL}://${SERVER_URL}/error`,
          {
            method: "POST",
            body: JSON.stringify({
              place: "stopRecording",
              msg: message
            })
          }
        )

        putInErrorState(message, setRecordingState)
      }
    }
  }, [recordingState]);

  const sendAudioToServer = useCallback(
    async (audioBlob: Blob, abort: AbortController) => {
      try {
        const response = await fetch(
          `${HTTP_PROTOCOL}://${SERVER_URL}/transcribe`,
          {
            method: "POST",
            body: audioBlob,
            signal: abort.signal,
          },
        );

        if (!response.ok) {
          const errorMessage =
            statusToErrorMessage.get(response.status) ||
            `Unexpected error: ${response.statusText}`;
          putInErrorState(errorMessage, setRecordingState);
          return;
        }

        const data = await response.json();
        setRecordingState({ kind: AudioStates.Idle });
        writeTranscribedText(data.data);
      } catch (error) {
        if(error instanceof DOMException && error.name === "AbortError") {
          return //the fetch request was PURPOSELY aborted, so the error is handled elsewhere
        }
        putInErrorState("Transcription failed. Please try again.", setRecordingState);
      }
    },
    [writeTranscribedText],
  );

  const resetErrorState = useCallback(() => {
    if (recordingState.kind === AudioStates.Error) {
      recordingState.removeTipTimeout &&
        clearTimeout(recordingState.removeTipTimeout);

      putInErrorState(recordingState.message, setRecordingState);
    }
  }, [recordingState]);

  return {
    recordingState,
    advanceState,
    resetErrorState,
  };
}

function putInErrorState(
  message: string,
  setRecordingState: React.Dispatch<React.SetStateAction<AudioStateUnion>>,
) {
  const timeoutId = setTimeout(() => {
    setRecordingState({ kind: AudioStates.Idle });
  }, ERROR_TIP_TIME_MS);

  setRecordingState({
    kind: AudioStates.Error,
    message: message,
    removeTipTimeout: timeoutId,
  });
}

const statusToErrorMessage = new Map<number, string>([
  [400, "Bad request. Please check your input and try again."],
  [401, "Unauthorized. Please check your permissions."],
  [402, "Payment Required. Please check your payment details."],
  [403, "Forbidden. You do not have permission to access this resource."],
  [404, "Not Found. The requested resource could not be found."],
  [429, "Too many requests. Please try again later."],
  [500, "Server error. Please try again later."],
  [
    502,
    "Bad Gateway. The server received an invalid response from the upstream server.",
  ],
  [
    503,
    "Service Unavailable. The server is currently unable to handle the request.",
  ],
  [
    504,
    "Gateway Timeout. The server did not receive a timely response from the upstream server.",
  ],
]);
