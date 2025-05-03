export function micRecorder() {
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
    });

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
export function getSupportedAudioMimeType() {
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
