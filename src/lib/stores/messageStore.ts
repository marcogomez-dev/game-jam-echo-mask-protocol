import { writable } from "svelte/store";

export type MessageType =
  | "tutorial"
  | "story"
  | "gameplay"
  | "warning"
  | "success"
  | "masks_summary"
  | "notes_summary"
  | "score_upload";

export interface Message {
  id?: string;
  type: MessageType;
  title?: string;
  text?: string;
  duration?: number;
  icon?: string;
  data?: any;
}

function createMessageStore() {
  const { subscribe, update } = writable<Message | null>(null);

  return {
    subscribe,
    show: (msg: Message) => {
      update(() => msg);
      if (msg.duration) {
        setTimeout(() => {
          update((current) =>
            current && current.id === msg.id ? null : current,
          );
        }, msg.duration);
      }
    },
    dismiss: () => update(() => null),
  };
}

export const messageStore = createMessageStore();
