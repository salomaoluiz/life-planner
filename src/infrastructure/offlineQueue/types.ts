export interface FlushResult {
  dropped: Array<{ entry: QueueEntry; reason: string }>;
  sent: QueueEntry[];
}

export type Processor = (entry: QueueEntry) => Promise<ProcessResult>;

// What the sender answers for one entry: sent, refused for good (dropped) or no connection (stop and retry later).
export type ProcessResult =
  | { reason: string; status: "DROPPED" }
  | { status: "OFFLINE" }
  | { status: "SENT" };

// A mutation waiting to be sent (spec 117 FR 21). `clientId` is also the `Idempotency-Key`.
export interface QueueEntry {
  clientId: string;
  createdAt: number;
  itemId: string;
  itemName: string;
  kind: QueueEntryKind;
  ownerId: string;
  payload: Record<string, unknown>;
}

// The first three are the stock quick movements (spec 117); the rest are the shopping-mode writes (spec 120).
export type QueueEntryKind =
  | "EXPIRATION"
  | "MOVEMENT"
  | "PURCHASE_DISCARD"
  | "PURCHASE_END"
  | "PURCHASE_ROW"
  | "PURCHASE_ROW_DELETE"
  | "UNDO";
