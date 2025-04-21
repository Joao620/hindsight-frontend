import { useState, useCallback } from "react";
import { micRecorder, getSupportedAudioMimeType } from "./audioUtils"; // Assume audioUtils.ts contains micRecorder and getSupportedAudioMimeType
import { HTTP_PROTOCOL, SERVER_URL } from "~/contants";

export enum AudioStates {
  Idle,
  Hearing,
  Processing,
  Sending,
  Canceling,
  Error,
  f,
}

type AudioStateUnion =
  | { kind: AudioStates.Idle }
  | { kind: AudioStates.Hearing; stopRecord: ReturnType<typeof micRecorder> }
  | { kind: AudioStates.Processing }
  | { kind: AudioStates.Sending; audioData: Blob }
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

  const startRecording = useCallback(() => {
    const stopAudio = micRecorder();
    setRecordingState({
      kind: AudioStates.Hearing,
      stopRecord: stopAudio,
    });
  }, []);

  const stopRecording = useCallback(async () => {
    if (recordingState.kind === AudioStates.Hearing) {
      setRecordingState({ kind: AudioStates.Processing });
      try {
        const audioBlob = await recordingState.stopRecord();
        setRecordingState({
          kind: AudioStates.Sending,
          audioData: audioBlob,
        });

        // Move the fetch logic to a separate function
        await sendAudioToServer(audioBlob);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "unknown error. This should not be happening";
        setRecordingState({
          kind: AudioStates.Error,
          message,
        });
      }
    }
  }, [recordingState]);

  const sendAudioToServer = useCallback(
    async (audioBlob: Blob) => {
      try {
        const response = await fetch(
          `${HTTP_PROTOCOL}://${SERVER_URL}/transcribe`,
          {
            method: "POST",
            body: audioBlob,
          },
        );

        if (!response.ok) {
          let errorMessage = "Transcription failed. Please try again.";
          if (response.status === 400) {
            errorMessage =
              "Bad request. Please check your input and try again.";
          } else if (response.status === 401) {
            errorMessage = "Unauthorized. Please check your permissions.";
          } else if (response.status === 429) {
            errorMessage = "Too many requests. Please try again later.";
          } else if (response.status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage = `Unexpected error: ${response.statusText}`;
          }
          setRecordingState({ kind: AudioStates.Error, message: errorMessage });
          return;
        }

        const data = await response.json();
        setRecordingState({ kind: AudioStates.Idle });
        writeTranscribedText(data.data);
      } catch (error) {
        console.error(error);
        setRecordingState({
          kind: AudioStates.Error,
          message: "Transcription failed. Please try again.",
        });
      }
    },
    [writeTranscribedText],
  );

  return {
    recordingState,
    startRecording,
    stopRecording,
  };
}
