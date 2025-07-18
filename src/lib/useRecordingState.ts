import { useCallback, useState, useEffect, useRef } from "react";
import { HTTP_PROTOCOL, SERVER_URL } from "~/contants";
import { micRecorder } from "~/lib/audioUtils";

const ERROR_TIP_TIME_MS = 5000;

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

// Polling Configuration
export interface PollingConfig {
  initialInterval: number; // 1000ms
  maxInterval: number; // 5000ms
  backoffMultiplier: number; // 1.5
  maxRetries: number; // 30 (total ~2-3 minutes)
}

export const POLLING_CONFIG: PollingConfig = {
  initialInterval: 1000, // Start with 1 second intervals
  maxInterval: 5000, // Cap at 5 second intervals
  backoffMultiplier: 1.5, // Increase interval by 50% each time
  maxRetries: 30, // Maximum 30 polling attempts (~2-3 minutes total)
};

// Polling Interval Management Utilities
export function calculateNextPollingInterval(
  currentPollCount: number,
  config: PollingConfig = POLLING_CONFIG,
): number {
  const exponentialInterval =
    config.initialInterval * config.backoffMultiplier ** currentPollCount;
  return Math.min(exponentialInterval, config.maxInterval);
}

export function shouldStopPolling(
  currentPollCount: number,
  config: PollingConfig = POLLING_CONFIG,
): boolean {
  return currentPollCount >= config.maxRetries;
}

export function createPollingDelay(
  intervalMs: number,
  abortController: AbortController,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      resolve();
    }, intervalMs);

    // Handle cancellation
    abortController.signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      reject(new DOMException("Polling was cancelled", "AbortError"));
    });
  });
}

// API Response Interfaces
export interface TranscribeSubmissionResponse {
  taskId: string;
}

export interface TranscribeStatusResponse {
  status: "pending" | "processing" | "completed" | "failed";
  result?: {
    data: string; // The transcribed text
  };
  error?: string;
}

export enum AudioStates {
  Idle = "Idle",
  Hearing = "Hearing",
  Processing = "Processing",
  Sending = "Sending",
  Polling = "Polling",
  Canceling = "Canceling",
  Error = "Error",
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
    kind: AudioStates.Polling;
    taskId: string;
    abortControl: AbortController;
    pollCount: number;
  }
  | {
    kind: AudioStates.Error;
    message: string;
    removeTipTimeout?: ReturnType<typeof setTimeout>;
  }
  | { kind: AudioStates.Canceling };

// Polling mechanism for transcription status
export async function pollTranscriptionStatus(
  taskId: string,
  abortController: AbortController,
  pollCount: number,
  setRecordingState: React.Dispatch<React.SetStateAction<AudioStateUnion>>,
  writeTranscribedText: (text: string) => void,
  config: PollingConfig = POLLING_CONFIG,
): Promise<void> {
  try {
    // Check if we should stop polling due to max retries
    if (shouldStopPolling(pollCount, config)) {
      putInErrorState(
        "Transcription timeout after maximum polling attempts. Please try again.",
        setRecordingState,
      );
      return;
    }

    // Make the status check request
    const response = await fetch(
      `${HTTP_PROTOCOL}://${SERVER_URL}/transcribe/${taskId}`,
      {
        method: "GET",
        signal: abortController.signal,
      },
    );

    if (!response.ok) {
      // Enhanced error handling for specific HTTP status codes
      let errorMessage =
        statusToErrorMessage.get(response.status) ||
        `Transcription status check failed: ${response.statusText}`;

      putInErrorState(errorMessage, setRecordingState);
      return;
    }

    const statusData: TranscribeStatusResponse = await response.json();

    // Handle different status responses
    switch (statusData.status) {
      case "completed": {
        // Extract transcribed text and complete the process
        if (statusData.result?.data) {
          writeTranscribedText(statusData.result.data);
          setRecordingState({ kind: AudioStates.Idle });
        } else {
          putInErrorState(
            "Transcription completed but no text was returned",
            setRecordingState,
          );
        }
        return;
      }

      case "failed": {
        // Handle failed transcription
        const errorMsg =
          statusData.error || "Transcription failed on the server";
        putInErrorState(errorMsg, setRecordingState);
        return;
      }

      case "pending":
      case "processing": {
        // Continue polling - update state with new poll count
        const nextPollCount = pollCount + 1;
        setRecordingState({
          kind: AudioStates.Polling,
          taskId: taskId,
          abortControl: abortController,
          pollCount: nextPollCount,
        });

        // Calculate next polling interval
        const nextInterval = calculateNextPollingInterval(pollCount, config);

        // Wait for the polling interval
        await createPollingDelay(nextInterval, abortController);

        // Continue polling recursively
        await pollTranscriptionStatus(
          taskId,
          abortController,
          nextPollCount,
          setRecordingState,
          writeTranscribedText,
          config,
        );
        return;
      }

      default:
        putInErrorState(
          `Unknown transcription status: ${statusData.status}`,
          setRecordingState,
        );
        return;
    }
  } catch (error) {
    // Handle cancellation
    if (error instanceof DOMException && error.name === "AbortError") {
      // Polling was cancelled, transition to canceling state is handled by advanceState
      return;
    }

    // Enhanced network error handling
    let errorMessage: string;

    if (error instanceof TypeError) {
      // Network connectivity issues (fetch fails completely)
      errorMessage = "Network connection failed during transcription status check. Please check your internet connection and try again.";
    } else if (error instanceof Error) {
      // Other specific errors
      if (error.message.includes("timeout")) {
        errorMessage = "Request timeout during transcription status check. Please try again.";
      } else if (error.message.includes("Failed to fetch")) {
        errorMessage = "Unable to connect to transcription service. Please check your connection and try again.";
      } else {
        errorMessage = `Network error during transcription status check: ${error.message}`;
      }
    } else {
      // Unknown error type
      errorMessage = "Unexpected error during transcription status check. Please try again.";
    }

    putInErrorState(errorMessage, setRecordingState);
  }
}

export function useRecordingState(
  writeTranscribedText: (text: string) => void,
) {
  const [recordingState, setRecordingState] = useState<AudioStateUnion>({
    kind: AudioStates.Idle,
  });

  // Use a ref to track the current state for cleanup purposes
  const currentStateRef = useRef(recordingState);
  currentStateRef.current = recordingState;

  // Helper function to handle canceling state transitions with proper cleanup
  const transitionToCancelingState = useCallback(() => {
    setRecordingState({ kind: AudioStates.Canceling });
    // Transition to idle after a brief canceling state to provide visual feedback
    setTimeout(() => {
      setRecordingState({ kind: AudioStates.Idle });
    }, 500);
  }, []);

  const startRecording = useCallback(() => {
    const stopAudio = micRecorder();
    setRecordingState({
      kind: AudioStates.Hearing,
      stopRecord: stopAudio,
    });
  }, []);

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

        const data: TranscribeSubmissionResponse = await response.json();

        // Extract task ID and transition to polling state
        if (!data.taskId) {
          putInErrorState(
            "Invalid server response: missing task ID",
            setRecordingState,
          );
          return;
        }

        // Create new abort controller for polling phase
        const pollingAbortController = new AbortController();

        setRecordingState({
          kind: AudioStates.Polling,
          taskId: data.taskId,
          abortControl: pollingAbortController,
          pollCount: 0,
        });

        // Start polling for transcription status
        await pollTranscriptionStatus(
          data.taskId,
          pollingAbortController,
          0,
          setRecordingState,
          writeTranscribedText,
        );
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // the fetch request was PURPOSELY aborted, so the error is handled elsewhere
        }
        putInErrorState(
          "Transcription failed. Please try again.",
          setRecordingState,
        );
      }
    },
    [writeTranscribedText],
  );

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

        fetch(`${HTTP_PROTOCOL}://${SERVER_URL}/error`, {
          method: "POST",
          body: JSON.stringify({
            place: "stopRecording",
            msg: message,
          }),
        });

        putInErrorState(message, setRecordingState);
      }
    }
  }, [recordingState, sendAudioToServer]);

  const advanceState = useCallback(() => {
    switch (recordingState.kind) {
      case AudioStates.Idle:
        startRecording();
        break;

      case AudioStates.Hearing:
        stopRecording();
        break;

      case AudioStates.Sending:
        // Cancel the sending operation with proper cleanup
        recordingState.abortControl.abort();
        transitionToCancelingState();
        break;

      case AudioStates.Polling:
        // Cancel the polling operation with proper cleanup
        recordingState.abortControl.abort();
        transitionToCancelingState();
        break;

      case AudioStates.Error:
        // Allow user to dismiss error and return to idle
        if (recordingState.removeTipTimeout) {
          clearTimeout(recordingState.removeTipTimeout);
        }
        setRecordingState({ kind: AudioStates.Idle });
        break;

      case AudioStates.Processing:
      case AudioStates.Canceling:
        // These states don't respond to user input
        break;

      default:
        // Ensure we handle any unexpected states gracefully
        console.warn(`Unexpected state in advanceState`);
        setRecordingState({ kind: AudioStates.Idle });
        break;
    }
  }, [recordingState, startRecording, stopRecording, transitionToCancelingState]);

  const resetErrorState = useCallback(() => {
    if (recordingState.kind === AudioStates.Error) {
      recordingState.removeTipTimeout &&
        clearTimeout(recordingState.removeTipTimeout);

      putInErrorState(recordingState.message, setRecordingState);
    }
  }, [recordingState]);

  // Cleanup effect to ensure proper resource cleanup during unmount only
  useEffect(() => {
    console.log("my state is: ", recordingState)
  }, [recordingState]);

  // Cleanup effect that only runs on unmount
  useEffect(() => {
    return () => {
      // Cleanup any active operations when component unmounts
      const currentState = currentStateRef.current;
      switch (currentState.kind) {
        case AudioStates.Sending:
        case AudioStates.Polling:
          // Abort any ongoing network operations
          currentState.abortControl.abort();
          break;
        case AudioStates.Error:
          // Clear any pending error timeouts
          if (currentState.removeTipTimeout) {
            clearTimeout(currentState.removeTipTimeout);
          }
          break;
        // Removed the Hearing case cleanup as it was causing double stopRecord() calls
        // The stopRecording function should handle stopping the recording properly
      }
    };
  }, []); // Empty dependency array means this only runs on mount/unmount

  // Enhanced state transition validation
  useEffect(() => {
    // Validate state transitions and ensure consistency
    switch (recordingState.kind) {
      case AudioStates.Sending:
        // Ensure we have audio data and abort controller
        if (!recordingState.audioData || !recordingState.abortControl) {
          console.warn("Invalid Sending state: missing required data");
          setRecordingState({ kind: AudioStates.Idle });
        }
        break;
      case AudioStates.Polling:
        // Ensure we have task ID and abort controller
        if (!recordingState.taskId || !recordingState.abortControl) {
          console.warn("Invalid Polling state: missing required data");
          setRecordingState({ kind: AudioStates.Idle });
        }
        break;
      case AudioStates.Hearing:
        // Ensure we have stop recording function
        if (!recordingState.stopRecord) {
          console.warn("Invalid Hearing state: missing stop recording function");
          setRecordingState({ kind: AudioStates.Idle });
        }
        break;
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