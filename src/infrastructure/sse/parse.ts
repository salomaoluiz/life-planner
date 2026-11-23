export interface SseMessage {
  data: string;
  event: string;
  id?: string;
}

// Spec 120 FR 24-25: splits a growing `text/event-stream` buffer into complete messages and the unfinished rest.
// Comment lines (heartbeats) are dropped; a message without data is dropped too.
export function parseEventChunk(buffer: string): {
  messages: SseMessage[];
  rest: string;
} {
  const normalized = buffer.replace(/\r\n/g, "\n");
  const blocks = normalized.split("\n\n");
  const rest = blocks.pop() ?? "";
  const messages: SseMessage[] = [];

  for (const block of blocks) {
    let id: string | undefined;
    let event = "message";
    const data: string[] = [];

    for (const line of block.split("\n")) {
      if (line.startsWith(":") || line === "") {
        continue;
      }

      const separator = line.indexOf(":");
      const field = separator === -1 ? line : line.slice(0, separator);
      const value =
        separator === -1 ? "" : line.slice(separator + 1).replace(/^ /, "");

      if (field === "id") {
        id = value;
      } else if (field === "event") {
        event = value;
      } else if (field === "data") {
        data.push(value);
      }
    }

    if (data.length > 0 || event === "resync") {
      messages.push({ data: data.join("\n"), event, id });
    }
  }

  return { messages, rest };
}

// Spec 120 FR 25: 1 s, 2 s, 4 s … up to 60 s, with up to 25% jitter.
export function reconnectDelay(
  attempt: number,
  random = Math.random(),
): number {
  const base = Math.min(60_000, 1000 * 2 ** attempt);

  return Math.round(base + base * 0.25 * random);
}
