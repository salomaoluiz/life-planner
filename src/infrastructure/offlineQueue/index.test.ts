import { asyncStorage } from "@infrastructure/storage";

import { offlineQueue, QueueEntry } from "./index";

jest.mock("@infrastructure/storage", () => {
  const store = new Map<string, string>();

  return {
    __store: store,
    asyncStorage: {
      getString: jest.fn((key: string) => store.get(key) ?? null),
      setString: jest.fn((key: string, value: string) => store.set(key, value)),
    },
    StorageKeys: { string: { OFFLINE_QUEUE: "@offline_queue" } },
  };
});

function entry(clientId: string): QueueEntry {
  return {
    clientId,
    createdAt: 1,
    itemId: "item",
    itemName: "Leite",
    kind: "MOVEMENT",
    ownerId: "owner",
    payload: { quantity: 1, type: "CONSUME" },
  };
}

beforeEach(() => {
  (
    jest.requireMock("@infrastructure/storage") as {
      __store: Map<string, string>;
    }
  ).__store.clear();
  offlineQueue.reset();
});

it("SHOULD persist entries in order and survive a restart (a fresh read of the storage)", () => {
  offlineQueue.enqueue(entry("a"));
  offlineQueue.enqueue(entry("b"));
  offlineQueue.reset();

  expect(offlineQueue.list().map((row) => row.clientId)).toEqual(["a", "b"]);
  expect(asyncStorage.setString).toHaveBeenCalled();
});

it("SHOULD notify subscribers on enqueue and remove, and remove a never-sent entry", () => {
  const listener = jest.fn();
  const unsubscribe = offlineQueue.subscribe(listener);

  offlineQueue.enqueue(entry("a"));
  offlineQueue.remove("a");
  offlineQueue.remove("missing");
  unsubscribe();
  offlineQueue.enqueue(entry("b"));

  expect(listener).toHaveBeenCalledTimes(2);
  expect(offlineQueue.list().map((row) => row.clientId)).toEqual(["b"]);
});

it("SHOULD send in order, drop the refused and keep the rest WHEN it goes offline", async () => {
  ["a", "b", "c", "d"].forEach((id) => offlineQueue.enqueue(entry(id)));

  const seen: string[] = [];
  const result = await offlineQueue.flush(async (row) => {
    seen.push(row.clientId);

    if (row.clientId === "a") {
      return { status: "SENT" };
    }

    if (row.clientId === "b") {
      return { reason: "deleted", status: "DROPPED" };
    }

    return { status: "OFFLINE" };
  });

  expect(seen).toEqual(["a", "b", "c"]);
  expect(result.sent.map((row) => row.clientId)).toEqual(["a"]);
  expect(result.dropped).toEqual([
    { entry: expect.objectContaining({ clientId: "b" }), reason: "deleted" },
  ]);
  expect(offlineQueue.list().map((row) => row.clientId)).toEqual(["c", "d"]);
});

it("SHOULD share one flush WHEN called twice at the same time", async () => {
  offlineQueue.enqueue(entry("a"));

  const processor = jest.fn(async () => ({ status: "SENT" as const }));
  const [first, second] = await Promise.all([
    offlineQueue.flush(processor),
    offlineQueue.flush(processor),
  ]);

  expect(processor).toHaveBeenCalledTimes(1);
  expect(first).toBe(second);
});

it("SHOULD start empty WHEN the stored value is corrupt", () => {
  (
    jest.requireMock("@infrastructure/storage") as {
      __store: Map<string, string>;
    }
  ).__store.set("@offline_queue", "{oops");
  offlineQueue.reset();

  expect(offlineQueue.list()).toEqual([]);
});
