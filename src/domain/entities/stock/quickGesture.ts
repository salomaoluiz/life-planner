// Spec 117 FR 4: taps on the same item and direction inside a gesture become one request.
export const STOCK_GESTURE_IDLE_MS = 2000;

const MILLI = 1000;

export type ExpiredChoice =
  | "DISCARD_THEN_VALID"
  | "EXPIRED_FIRST"
  | "VALID_ONLY";

export interface Gesture {
  // The expired-lot answer applies to the remaining taps of the gesture (FR 15).
  expiredChoice?: ExpiredChoice;
  gestureId: string;
  itemId: string;
  lastTapAt: number;
  // Signed thousandths of the item unit: negative takes, positive adds.
  netMilli: number;
}

export interface GestureRequest {
  quantity: number;
  type: "CONSUME" | "ENTRY";
}

export interface TapInput {
  direction: -1 | 1;
  itemId: string;
  newId: () => string;
  now: number;
  step: number;
}

export interface TapResult {
  // The previous gesture when the tap was on another item: it ends now.
  flushed?: Gesture;
  gesture: Gesture;
}

export function isIdle(gesture: Gesture, now: number): boolean {
  return now - gesture.lastTapAt >= STOCK_GESTURE_IDLE_MS;
}

// The quantity the row shows while the gesture is pending (optimistic, never below 0).
export function pendingQuantity(
  base: number,
  gesture: Gesture | undefined,
): number {
  if (!gesture) {
    return base;
  }

  return Math.max(0, Math.round(base * MILLI) + gesture.netMilli) / MILLI;
}

export function tap(current: Gesture | undefined, input: TapInput): TapResult {
  const delta = input.direction * Math.round(input.step * MILLI);

  if (
    current &&
    current.itemId === input.itemId &&
    !isIdle(current, input.now)
  ) {
    return {
      gesture: {
        ...current,
        lastTapAt: input.now,
        netMilli: current.netMilli + delta,
      },
    };
  }

  return {
    flushed: current,
    gesture: {
      gestureId: input.newId(),
      itemId: input.itemId,
      lastTapAt: input.now,
      netMilli: delta,
    },
  };
}

// A net of 0 sends nothing.
export function toRequest(gesture: Gesture): GestureRequest | undefined {
  if (gesture.netMilli === 0) {
    return undefined;
  }

  return {
    quantity: Math.abs(gesture.netMilli) / MILLI,
    type: gesture.netMilli < 0 ? "CONSUME" : "ENTRY",
  };
}
