import {
  isIdle,
  pendingQuantity,
  STOCK_GESTURE_IDLE_MS,
  tap,
  toRequest,
} from "./quickGesture";

function newId() {
  return "g1";
}
const base = { itemId: "milk", newId, step: 1 };

describe("tap", () => {
  it("SHOULD merge taps of the same item and direction inside the window", () => {
    let result = tap(undefined, { ...base, direction: -1, now: 0 });
    result = tap(result.gesture, { ...base, direction: -1, now: 500 });
    result = tap(result.gesture, { ...base, direction: -1, now: 900 });

    expect(toRequest(result.gesture)).toEqual({ quantity: 3, type: "CONSUME" });
    expect(result.flushed).toBeUndefined();
  });

  it("SHOULD reduce the sum WHEN the opposite direction is tapped, and send nothing at net 0", () => {
    let result = tap(undefined, { ...base, direction: -1, now: 0 });

    result = tap(result.gesture, { ...base, direction: 1, now: 100 });

    expect(toRequest(result.gesture)).toBeUndefined();

    result = tap(result.gesture, { ...base, direction: 1, now: 200 });

    expect(toRequest(result.gesture)).toEqual({ quantity: 1, type: "ENTRY" });
  });

  it("SHOULD end the previous gesture WHEN another item is tapped", () => {
    const first = tap(undefined, { ...base, direction: -1, now: 0 });
    const second = tap(first.gesture, {
      ...base,
      direction: -1,
      itemId: "rice",
      now: 100,
    });

    expect(second.flushed).toBe(first.gesture);
    expect(second.gesture.itemId).toBe("rice");
  });

  it("SHOULD start a new gesture WHEN the previous one went idle", () => {
    const first = tap(undefined, { ...base, direction: -1, now: 0 });
    const later = tap(first.gesture, {
      ...base,
      direction: -1,
      now: STOCK_GESTURE_IDLE_MS,
    });

    expect(isIdle(first.gesture, STOCK_GESTURE_IDLE_MS)).toBe(true);
    expect(later.flushed).toBe(first.gesture);
    expect(toRequest(later.gesture)).toEqual({ quantity: 1, type: "CONSUME" });
  });

  it("SHOULD add decimals exactly (0.1 + 0.2 = 0.3)", () => {
    let result = tap(undefined, { ...base, direction: -1, now: 0, step: 0.1 });

    result = tap(result.gesture, { ...base, direction: -1, now: 1, step: 0.2 });

    expect(toRequest(result.gesture)?.quantity).toBe(0.3);
  });
});

describe("pendingQuantity", () => {
  it("SHOULD apply the net to the base quantity and never go below 0", () => {
    const gesture = tap(undefined, {
      ...base,
      direction: -1,
      now: 0,
      step: 5,
    }).gesture;

    expect(pendingQuantity(3, gesture)).toBe(0);
    expect(pendingQuantity(8, gesture)).toBe(3);
    expect(pendingQuantity(8, undefined)).toBe(8);
  });
});
