import { parseEventChunk, reconnectDelay } from "./parse";

describe("parseEventChunk", () => {
  it("SHOULD read id, event and data of complete messages AND keep the unfinished rest", () => {
    const result = parseEventChunk(
      'id: 5\nevent: row.upserted\ndata: {"a":1}\n\n: ping\n\nid: 6\nevent: purchase.ended\ndata: {',
    );

    expect(result.messages).toEqual([
      { data: '{"a":1}', event: "row.upserted", id: "5" },
    ]);
    expect(result.rest).toBe("id: 6\nevent: purchase.ended\ndata: {");
  });

  it("SHOULD join multi-line data, default the event AND handle CRLF", () => {
    const result = parseEventChunk("data: a\r\ndata: b\r\n\r\n");

    expect(result.messages).toEqual([
      { data: "a\nb", event: "message", id: undefined },
    ]);
  });

  it("SHOULD keep a resync without data AND drop messages without data", () => {
    const result = parseEventChunk("event: resync\ndata: {}\n\nid: 1\n\n");

    expect(result.messages.map((message) => message.event)).toEqual(["resync"]);
  });

  it("SHOULD ignore a field line without a colon", () => {
    expect(parseEventChunk("event\nretry\n\n").messages).toEqual([]);
    expect(parseEventChunk("").rest).toBe("");
  });
});

describe("reconnectDelay", () => {
  it("SHOULD double from one second up to one minute with jitter", () => {
    expect(reconnectDelay(0, 0)).toBe(1000);
    expect(reconnectDelay(1, 0)).toBe(2000);
    expect(reconnectDelay(2, 0)).toBe(4000);
    expect(reconnectDelay(10, 0)).toBe(60_000);
    expect(reconnectDelay(0, 1)).toBe(1250);
  });
});
