import { asyncStorage, StorageKeys } from "@infrastructure/storage";

import { FlushResult, Processor, QueueEntry } from "./types";

type Listener = () => void;
type QueueStorageKey = Parameters<typeof asyncStorage.getString>[0];

// A persistent FIFO of mutations (AsyncStorage/MMKV on native, localStorage on web), one per storage key: the stock
// quick movements (spec 117 FR 21-24) and the shopping-mode writes (spec 120 FR 21) never share a processor.
function createOfflineQueue(storageKey: QueueStorageKey) {
  const listeners = new Set<Listener>();
  let flushing: Promise<FlushResult> | undefined;
  // A stable snapshot for `useSyncExternalStore`: replaced only when the stored queue changes.
  let snapshot: QueueEntry[] | undefined;

  function read(): QueueEntry[] {
    if (!snapshot) {
      try {
        const raw = asyncStorage.getString(storageKey);

        snapshot = raw ? (JSON.parse(raw) as QueueEntry[]) : [];
      } catch {
        snapshot = [];
      }
    }

    return snapshot;
  }

  function write(entries: QueueEntry[]) {
    snapshot = entries;
    asyncStorage.setString(storageKey, JSON.stringify(entries));
    listeners.forEach((listener) => listener());
  }

  const queue = {
    enqueue(entry: QueueEntry) {
      write([...read(), entry]);
    },

    // Sends in order. Stops at the first OFFLINE (the rest waits); SENT and DROPPED leave the queue.
    async flush(processor: Processor): Promise<FlushResult> {
      if (flushing) {
        return flushing;
      }

      flushing = (async () => {
        const result: FlushResult = { dropped: [], sent: [] };

        for (const entry of [...read()]) {
          const outcome = await processor(entry);

          if (outcome.status === "OFFLINE") {
            break;
          }

          queue.remove(entry.clientId);

          if (outcome.status === "SENT") {
            result.sent.push(entry);
          } else {
            result.dropped.push({ entry, reason: outcome.reason });
          }
        }

        return result;
      })().finally(() => {
        flushing = undefined;
      });

      return flushing;
    },

    getSnapshot(): QueueEntry[] {
      return read();
    },

    list(): QueueEntry[] {
      return [...read()];
    },

    // Undo of a gesture that was never sent just removes it (FR 24).
    remove(clientId: string) {
      const entries = read();

      if (entries.some((entry) => entry.clientId === clientId)) {
        write(entries.filter((entry) => entry.clientId !== clientId));
      }
    },

    // Test helper: forget the in-memory copy so the next read goes to the storage again.
    reset() {
      snapshot = undefined;
      flushing = undefined;
    },

    subscribe(listener: Listener) {
      listeners.add(listener);

      return () => listeners.delete(listener);
    },
  };

  return queue;
}

const offlineQueue = createOfflineQueue(StorageKeys.string.OFFLINE_QUEUE);
// Spec 120 FR 21: the shopping-mode writes (rows, end, discard) wait here.
const purchaseQueue = createOfflineQueue(
  StorageKeys.string.PURCHASE_OFFLINE_QUEUE,
);

export type {
  FlushResult,
  Processor,
  ProcessResult,
  QueueEntry,
} from "./types";
export { createOfflineQueue, offlineQueue, purchaseQueue };
