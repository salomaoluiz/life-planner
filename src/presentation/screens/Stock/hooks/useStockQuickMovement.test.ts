import { act, renderHook } from "@testing-library/react-native";

import { useCases } from "@application/useCases";
import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  StockNotEnoughQuantity,
} from "@domain/entities/errors";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { offlineQueue } from "@infrastructure/offlineQueue";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useStockQuickMovement, { NOTICE_MS } from "./useStockQuickMovement";

jest.mock("@application/useCases", () => ({
  useCases: {
    createStockMovementUseCase: { execute: jest.fn() },
    getStockItemUseCase: { execute: jest.fn() },
    setStockGestureExpirationUseCase: { execute: jest.fn() },
    undoStockGestureUseCase: { execute: jest.fn() },
  },
}));
jest.mock("@presentation/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@infrastructure/uuid", () => {
  let counter = 0;

  return { uuidv4: () => `uuid-${(counter += 1)}` };
});
jest.mock("@infrastructure/offlineQueue", () => {
  let snapshot: unknown[] = [];
  const listeners = new Set<() => void>();

  return {
    offlineQueue: {
      enqueue: jest.fn((entry: unknown) => {
        snapshot = [...snapshot, entry];
        listeners.forEach((listener) => listener());
      }),
      flush: jest.fn().mockResolvedValue({ dropped: [], sent: [] }),
      getSnapshot: () => snapshot,
      list: () => snapshot,
      remove: jest.fn(),
      reset: () => {
        snapshot = [];
      },
      subscribe: (listener: () => void) => {
        listeners.add(listener);

        return () => listeners.delete(listener);
      },
    },
  };
});

const create = jest.mocked(useCases.createStockMovementUseCase.execute);
const undo = jest.mocked(useCases.undoStockGestureUseCase.execute);
const detail = jest.mocked(useCases.getStockItemUseCase.execute);
const milk = dto((f) =>
  f
    .withId("milk")
    .withDescription("Leite")
    .withUnit(StockUnits.UNIT)
    .withQuantity(5),
);
const onSettled = jest.fn();

function setup() {
  return renderHook(() => useStockQuickMovement({ onSettled }));
}

beforeEach(() => {
  (offlineQueue as unknown as { reset: () => void }).reset();
  jest.useFakeTimers();
  jest.clearAllMocks();
  create.mockResolvedValue({} as never);
  undo.mockResolvedValue({} as never);
  onSettled.mockResolvedValue(undefined);
});

afterEach(() => {
  jest.useRealTimers();
});

describe("taps", () => {
  it("SHOULD merge three taps into one CONSUME sent after 2 s idle, with a notice and the optimistic quantity", async () => {
    const { result } = setup();

    act(() => {
      result.current.onStep(milk, -1, 1);
      result.current.onStep(milk, -1, 1);
      result.current.onStep(milk, -1, 1);
    });

    expect(result.current.displayQuantity(milk)).toBe(2);
    expect(result.current.notice).toMatchObject({ sent: false });
    expect(create).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(create).toHaveBeenCalledTimes(1);
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "milk",
        quantity: 3,
        type: "CONSUME",
      }),
    );
    expect(result.current.notice).toMatchObject({ sent: true });
    expect(onSettled).toHaveBeenCalled();
  });

  it("SHOULD send nothing WHEN the taps cancel each other out", async () => {
    const { result } = setup();

    act(() => {
      result.current.onStep(milk, -1, 1);
      result.current.onStep(milk, 1, 1);
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(create).not.toHaveBeenCalled();
    expect(result.current.notice).toBeUndefined();
    expect(result.current.displayQuantity(milk)).toBe(5);
  });

  it("SHOULD send ENTRY to the latest closed lot WHEN + is tapped", async () => {
    const { result } = setup();

    act(() => result.current.onStep(milk, 1, 2));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 2,
        target: "LATEST_CLOSED",
        type: "ENTRY",
      }),
    );
    expect(result.current.notice?.canSetExpiration).toBe(true);
  });

  it("SHOULD cancel locally WHEN Desfazer is pressed before the send", async () => {
    const { result } = setup();

    act(() => result.current.onStep(milk, -1, 1));
    await act(async () => {
      await result.current.onUndo();
    });
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(create).not.toHaveBeenCalled();
    expect(undo).not.toHaveBeenCalled();
    expect(result.current.displayQuantity(milk)).toBe(5);
  });
});

describe("after the send", () => {
  async function sendOne() {
    const hook = setup();

    act(() => hook.result.current.onStep(milk, -1, 1));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    return hook;
  }

  it("SHOULD undo the gesture on the server and hide the notice after 6 s", async () => {
    const { result } = await sendOne();
    const gestureId = (create.mock.calls[0][0] as { gestureId: string })
      .gestureId;

    await act(async () => {
      await result.current.onUndo();
    });

    expect(undo).toHaveBeenCalledWith(
      expect.objectContaining({ gestureId, ownerId: milk.ownerId }),
    );

    act(() => result.current.onStep(milk, -1, 1));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    await act(async () => {
      jest.advanceTimersByTime(NOTICE_MS);
    });

    expect(result.current.notice).toBeUndefined();
  });

  it("SHOULD show the explanation WHEN the undo is refused as too late", async () => {
    const { result } = await sendOne();

    undo.mockRejectedValueOnce(
      Object.assign(new GenericError(), {
        context: {
          error: new ApiBusinessError("Não dá mais para desfazer", 409),
        },
      }),
    );
    await act(async () => {
      await result.current.onUndo();
    });

    expect(result.current.notice).toMatchObject({
      kind: "ERROR",
      message: "stock.offline.reasonRejected",
    });
  });
});

describe("failures", () => {
  it("SHOULD roll the row back and explain WHEN the server refuses (409)", async () => {
    const { result } = setup();

    create.mockRejectedValueOnce(new StockNotEnoughQuantity());
    act(() => result.current.onStep(milk, -1, 1));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.displayQuantity(milk)).toBe(5);
    expect(result.current.notice).toMatchObject({
      kind: "ERROR",
      message: "stock.offline.reasonNotEnough",
    });
    expect(offlineQueue.enqueue).not.toHaveBeenCalled();
  });

  it("SHOULD queue the movement with its Idempotency-Key WHEN offline", async () => {
    const { result } = setup();

    create.mockRejectedValueOnce(new ConnectivityError());
    act(() => result.current.onStep(milk, -1, 1));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(offlineQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "milk",
        kind: "MOVEMENT",
        payload: expect.objectContaining({ delta: -1, quantity: 1 }),
      }),
    );
    expect(result.current.isPending("milk")).toBe(true);
    expect(result.current.displayQuantity(milk)).toBe(4);
    expect(result.current.offlineCount).toBe(1);
  });
});

describe("expired lot question", () => {
  const withExpired = dto((f) =>
    f
      .withId("cheese")
      .withDescription("Queijo")
      .withUnit(StockUnits.UNIT)
      .withQuantity(3)
      .withHasExpiredLot(),
  );

  it("SHOULD ask before the first − and apply the answer to the gesture", async () => {
    detail.mockResolvedValue({
      lots: [
        { expirationStatus: StockLotStatus.EXPIRED, id: "a", quantity: 1 },
        { expirationStatus: StockLotStatus.OK, id: "b", quantity: 2 },
      ],
    } as never);

    const { result } = setup();

    await act(async () => {
      result.current.onStep(withExpired, -1, 1);
    });

    expect(result.current.expiredPrompt?.item.id).toBe("cheese");
    expect(result.current.expiredPrompt?.lots).toHaveLength(2);
    expect(
      result.current.hasExpiredValidLot(result.current.expiredPrompt?.lots),
    ).toBe(true);

    act(() => result.current.onChooseExpired("DISCARD_THEN_VALID"));
    act(() => result.current.onStep(withExpired, -1, 1));
    await act(async () => {
      jest.advanceTimersByTime(2000);
    });

    expect(result.current.expiredPrompt).toBeUndefined();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        expiredLots: "DISCARD_THEN_VALID",
        quantity: 2,
        type: "CONSUME",
      }),
    );
  });

  it("SHOULD write nothing WHEN the question is cancelled", async () => {
    detail.mockResolvedValue({ lots: [] } as never);

    const { result } = setup();

    await act(async () => {
      result.current.onStep(withExpired, -1, 1);
    });
    act(() => result.current.onExpiredCancel());

    expect(result.current.expiredPrompt).toBeUndefined();
    expect(create).not.toHaveBeenCalled();
  });
});

describe("exact quantity and Abri", () => {
  it("SHOULD send an exact quantity at once without waiting 2 s", async () => {
    const { result } = setup();
    const kilo = dto((f) =>
      f
        .withId("rice")
        .withDescription("Arroz")
        .withUnit(StockUnits.KILOGRAM)
        .withQuantity(2),
    );

    act(() => result.current.onExactOpen(kilo, -1));
    await act(async () => {
      result.current.onExactConfirm(-1, 0.3);
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        itemId: "rice",
        quantity: 0.3,
        type: "CONSUME",
      }),
    );
    expect(result.current.exact).toBeUndefined();
  });

  it("SHOULD send OPEN with quantity 1 and hide the chip", async () => {
    const { result } = setup();

    await act(async () => {
      await result.current.onOpen(milk);
    });

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ itemId: "milk", quantity: 1, type: "OPEN" }),
    );
    expect(result.current.isOpened("milk")).toBe(true);
  });
});
