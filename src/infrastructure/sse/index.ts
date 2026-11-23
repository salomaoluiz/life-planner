import { getBaseUrl } from "@infrastructure/api/transport";
import { tokenStorage } from "@infrastructure/token";

import { parseEventChunk, reconnectDelay, SseMessage } from "./parse";

export interface SseOptions {
  onMessage: (message: SseMessage) => void;
  // The server kept no memory of `Last-Event-ID` (older than 24 h): do a conditional GET (FR 25).
  onResync: () => void;
  onStatus?: (status: SseStatus) => void;
  path: string;
}

export type SseStatus = "CONNECTED" | "CONNECTING" | "DROPPED";

// Spec 120 FR 23-25: follows the events of a list while the shopping mode is open. When the stream drops it
// reconnects with exponential backoff and `Last-Event-ID`; there is no timer polling. Returns the stop function.
export function subscribeToEvents(options: SseOptions): () => void {
  let stopped = false;
  let attempt = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let abort: (() => void) | undefined;
  const state: { buffer: string; lastEventId?: string } = { buffer: "" };

  async function connect() {
    if (stopped) {
      return;
    }

    options.onStatus?.("CONNECTING");
    state.buffer = "";

    const token = await tokenStorage.getToken();

    if (stopped) {
      return;
    }

    let finished = false;

    abort = openOnce(options, token, state.lastEventId, state, (failed) => {
      if (finished || stopped) {
        return;
      }

      finished = true;
      attempt = failed ? attempt + 1 : 0;
      options.onStatus?.("DROPPED");
      timer = setTimeout(() => void connect(), reconnectDelay(attempt));
    });
  }

  void connect();

  return () => {
    stopped = true;
    clearTimeout(timer);
    abort?.();
  };
}

// A fetch-like reader over XMLHttpRequest: the only API that streams a response body on React Native and the web
// alike. The `Authorization` header goes on the request, never in the URL (FR 24).
function openOnce(
  options: SseOptions,
  token: null | string,
  lastEventId: string | undefined,
  state: { buffer: string; lastEventId?: string },
  done: (error?: boolean) => void,
): () => void {
  const request = new XMLHttpRequest();
  let seen = 0;

  request.open("GET", `${getBaseUrl()}${options.path}`);
  request.setRequestHeader("Accept", "text/event-stream");
  request.setRequestHeader("Cache-Control", "no-cache");

  if (token) {
    request.setRequestHeader("Authorization", `Bearer ${token}`);
  }
  if (lastEventId) {
    request.setRequestHeader("Last-Event-ID", lastEventId);
  }

  request.onreadystatechange = () => {
    if (request.readyState === 2 && request.status === 200) {
      options.onStatus?.("CONNECTED");
    }
  };
  request.onprogress = () => {
    state.buffer += request.responseText.slice(seen);
    seen = request.responseText.length;

    const { messages, rest } = parseEventChunk(state.buffer);

    state.buffer = rest;

    for (const message of messages) {
      if (message.id) {
        state.lastEventId = message.id;
      }

      if (message.event === "resync") {
        options.onResync();
      } else {
        options.onMessage(message);
      }
    }
  };
  request.onerror = () => done(true);
  request.onloadend = () => done(request.status !== 200);

  request.send();

  return () => request.abort();
}

export { parseEventChunk, reconnectDelay };
export type { SseMessage };
