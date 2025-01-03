import { UiReact } from "~/lib/store";

export function useParticipantIds() {
  return UiReact.useValue("participants_count");
}
