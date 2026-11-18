import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import {
  ExpiredChoice,
  Gesture,
  STOCK_GESTURE_IDLE_MS,
  tap,
  toRequest,
} from "@domain/entities/stock/quickGesture";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { offlineQueue, QueueEntry } from "@infrastructure/offlineQueue";
import useOfflineQueue from "@infrastructure/offlineQueue/useOfflineQueue";
import { uuidv4 } from "@infrastructure/uuid";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";
import { classifyFailure } from "@screens/Stock/models/quickMovementErrors";

export const NOTICE_MS = 6000;
// Spec 117 FR 11: a long press opens the exact quantity sheet.
export const LONG_PRESS_MS = 400;
const RETRY_MS = 15_000;

export interface ExactState {
  direction: QuickDirection;
  item: StockDTO;
}

export interface ExpiredPromptState {
  // Set when the question interrupted an exact quantity (the quantity waits for the answer).
  exactQuantity?: number;
  item: StockDTO;
  // The lots shown beside the options; `undefined` while they load.
  lots?: StockDTO["lots"];
}

export type QuickDirection = -1 | 1;

export interface QuickNotice {
  canSetExpiration: boolean;
  gestureId: string;
  id: number;
  itemId: string;
  kind: "ERROR" | "MOVE" | "REFUSED";
  message: string;
  // False while the gesture still waits for its 2 s: "Desfazer" cancels it locally.
  sent: boolean;
}

type MovementParams = Parameters<
  typeof useCases.createStockMovementUseCase.execute
>[0];

interface Options {
  onSettled: () => Promise<unknown> | void;
}

interface SentGesture {
  clientId: string;
  delta: number;
  item: StockDTO;
  queued: boolean;
}

let noticeCounter = 0;

export type StockQuickMovementVM = ReturnType<typeof useStockQuickMovement>;

export default useStockQuickMovement;

// One quick-movement engine per screen (list, quick add, location): optimistic quantities, merged taps, notice with
// undo, expired-lot question, "Abri" and the offline queue. Spec 117.
function useStockQuickMovement(options: Options) {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const queue = useOfflineQueue();
  const locale = getLocale().languageTag;
  // Signed deltas of gestures being tapped or in flight (units of the item), by item.
  const [inflight, setInflight] = useState<Record<string, number>>({});
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [notice, setNotice] = useState<QuickNotice | undefined>();
  const [exact, setExact] = useState<ExactState | undefined>();
  const [expiredPrompt, setExpiredPrompt] = useState<
    ExpiredPromptState | undefined
  >();
  const [expirationFor, setExpirationFor] = useState<string | undefined>();

  const gesture = useRef<Gesture | undefined>(undefined);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const items = useRef(new Map<string, StockDTO>());
  const sentGestures = useRef(new Map<string, SentGesture>());
  const latest = useRef({ locale, onSettled: options.onSettled, t });

  latest.current = { locale, onSettled: options.onSettled, t };

  function text(key: TranslationKeys, params?: Record<string, unknown>) {
    return latest.current.t(key, params);
  }

  function quantityText(item: StockDTO, quantity: number) {
    const formatted = formatQuantity(
      quantity,
      item.unit,
      latest.current.locale,
    );

    return item.unit === StockUnits.UNIT
      ? formatted.text
      : `${formatted.text} ${text(formatted.unitKey)}`;
  }

  function moveMessage(item: StockDTO, delta: number) {
    const quantity = quantityText(item, Math.abs(delta));

    return text(
      delta < 0 ? "stock.quick.noticeConsume" : "stock.quick.noticeEntry",
      { name: item.description, quantity },
    );
  }

  function showNotice(next: Omit<QuickNotice, "id">) {
    noticeCounter += 1;
    setNotice({ ...next, id: noticeCounter });
  }

  function setInflightDelta(itemId: string, delta: number | undefined) {
    setInflight((current) => {
      const next = { ...current };

      if (delta === undefined || delta === 0) {
        delete next[itemId];
      } else {
        next[itemId] = delta;
      }

      return next;
    });
  }

  // What the row shows: the server value plus queued movements plus the gesture being tapped or in flight.
  function displayQuantity(item: StockDTO) {
    const queued = queue.entries
      .filter((entry) => entry.itemId === item.id)
      .reduce((sum, entry) => sum + Number(entry.payload.delta ?? 0), 0);

    return Math.max(
      0,
      Math.round((item.quantity + queued + (inflight[item.id] ?? 0)) * 1000) /
        1000,
    );
  }

  function fail(
    item: StockDTO,
    gestureId: string,
    error: unknown,
    queueEntry: () => QueueEntry,
  ) {
    const failure = classifyFailure(error);

    if (failure.kind === "OFFLINE") {
      // The row keeps its optimistic value through the queue (deltas), marked "pending".
      offlineQueue.enqueue(queueEntry());
      const record = sentGestures.current.get(gestureId);

      if (record) {
        record.queued = true;
      }

      setInflightDelta(item.id, undefined);

      return;
    }

    setInflightDelta(item.id, undefined);
    setOpened((current) => {
      const next = new Set(current);

      next.delete(item.id);

      return next;
    });
    showNotice({
      canSetExpiration: false,
      gestureId,
      itemId: item.id,
      kind: "ERROR",
      message: text(failure.reasonKey),
      sent: true,
    });
  }

  async function sendMovement(
    item: StockDTO,
    params: {
      delta: number;
      expiredLots?: ExpiredChoice;
      gestureId: string;
      quantity: number;
      type: "CONSUME" | "ENTRY" | "OPEN";
    },
    message: string,
  ) {
    const clientId = uuidv4();
    const body = {
      clientId,
      expiredLots: params.type === "CONSUME" ? params.expiredLots : undefined,
      gestureId: params.gestureId,
      itemId: item.id,
      ownerId: item.ownerId,
      quantity: params.quantity,
      target: params.type === "ENTRY" ? "LATEST_CLOSED" : undefined,
      type: params.type,
    };

    sentGestures.current.set(params.gestureId, {
      clientId,
      delta: params.delta,
      item,
      queued: false,
    });
    showNotice({
      canSetExpiration: params.type === "ENTRY",
      gestureId: params.gestureId,
      itemId: item.id,
      kind: "MOVE",
      message,
      sent: true,
    });

    try {
      await useCases.createStockMovementUseCase.execute(body);
      await latest.current.onSettled();
      setInflightDelta(item.id, undefined);

      if (offlineQueue.list().length > 0) {
        void flush();
      }
    } catch (error) {
      fail(item, params.gestureId, error, () => ({
        clientId,
        createdAt: Date.now(),
        itemId: item.id,
        itemName: item.description,
        kind: "MOVEMENT",
        ownerId: item.ownerId,
        payload: { ...body, delta: params.delta },
      }));
      await latest.current.onSettled();
    }
  }

  async function sendGesture(current: Gesture) {
    const item = items.current.get(current.itemId);
    const request = toRequest(current);

    if (!item) {
      return;
    }

    if (!request) {
      setInflightDelta(item.id, undefined);
      setNotice((shown) =>
        shown?.gestureId === current.gestureId ? undefined : shown,
      );

      return;
    }

    await sendMovement(
      item,
      {
        delta: current.netMilli / 1000,
        expiredLots: current.expiredChoice,
        gestureId: current.gestureId,
        quantity: request.quantity,
        type: request.type,
      },
      moveMessage(item, current.netMilli / 1000),
    );
  }

  // Ends the gesture being tapped and sends it (idle, other item, blur, background).
  const commit = useCallback(async () => {
    clearTimeout(timer.current);
    timer.current = undefined;

    const current = gesture.current;

    gesture.current = undefined;

    if (current) {
      await sendGesture(current);
    }
  }, []);

  function applyTap(
    item: StockDTO,
    direction: QuickDirection,
    step: number,
    choice?: ExpiredChoice,
  ) {
    items.current.set(item.id, item);

    const result = tap(gesture.current, {
      direction,
      itemId: item.id,
      newId: uuidv4,
      now: Date.now(),
      step,
    });

    if (result.flushed) {
      void sendGesture(result.flushed);
    }

    gesture.current = {
      ...result.gesture,
      expiredChoice: choice ?? result.gesture.expiredChoice,
    };
    setInflightDelta(item.id, gesture.current.netMilli / 1000);

    const net = gesture.current.netMilli / 1000;

    if (net === 0) {
      setNotice(undefined);
    } else {
      showNotice({
        canSetExpiration: net > 0,
        gestureId: gesture.current.gestureId,
        itemId: item.id,
        kind: "MOVE",
        message: moveMessage(item, net),
        sent: false,
      });
    }

    clearTimeout(timer.current);
    timer.current = setTimeout(() => void commit(), STOCK_GESTURE_IDLE_MS);
  }

  async function openExpiredPrompt(state: ExpiredPromptState) {
    setExpiredPrompt(state);

    try {
      const detail = await useCases.getStockItemUseCase.execute({
        id: state.item.id,
      });

      setExpiredPrompt((current) =>
        current?.item.id === state.item.id
          ? { ...current, lots: detail.lots }
          : current,
      );
    } catch {
      // Without the lots the prompt still works with the three options.
      setExpiredPrompt((current) =>
        current ? { ...current, lots: [] } : current,
      );
    }
  }

  function onStep(item: StockDTO, direction: QuickDirection, step: number) {
    const running =
      gesture.current?.itemId === item.id ? gesture.current : undefined;

    if (direction === -1 && item.hasExpiredLot && !running?.expiredChoice) {
      void openExpiredPrompt({ item });

      return;
    }

    applyTap(item, direction, step);
  }

  async function runExact(
    item: StockDTO,
    direction: QuickDirection,
    quantity: number,
    choice?: ExpiredChoice,
  ) {
    await commit();
    applyTap(item, direction, quantity, choice);
    await commit();
  }

  function onChooseExpired(choice: ExpiredChoice) {
    const prompt = expiredPrompt;

    setExpiredPrompt(undefined);

    if (!prompt) {
      return;
    }

    if (prompt.exactQuantity !== undefined) {
      void runExact(prompt.item, -1, prompt.exactQuantity, choice);

      return;
    }

    applyTap(prompt.item, -1, prompt.item.quickStep ?? 1, choice);
  }

  function onExactConfirm(direction: QuickDirection, quantity: number) {
    const state = exact;

    setExact(undefined);

    if (!state || quantity <= 0) {
      return;
    }

    if (direction === -1 && state.item.hasExpiredLot) {
      void openExpiredPrompt({ exactQuantity: quantity, item: state.item });

      return;
    }

    void runExact(state.item, direction, quantity);
  }

  async function onOpen(item: StockDTO) {
    await commit();
    items.current.set(item.id, item);
    setOpened((current) => new Set(current).add(item.id));

    await sendMovement(
      item,
      {
        delta: 0,
        gestureId: uuidv4(),
        quantity: 1,
        type: "OPEN",
      },
      text("stock.quick.noticeOpened", { name: item.description }),
    );
  }

  async function onUndo() {
    const shown = notice;

    if (!shown || shown.kind !== "MOVE") {
      setNotice(undefined);

      return;
    }

    setNotice(undefined);

    if (!shown.sent) {
      // Cancelled before it was sent: nothing reached the server.
      clearTimeout(timer.current);
      gesture.current = undefined;
      setInflightDelta(shown.itemId, undefined);

      return;
    }

    const record = sentGestures.current.get(shown.gestureId);

    if (!record) {
      return;
    }

    if (record.queued) {
      // Never sent: just take it out of the queue (FR 24).
      offlineQueue.remove(record.clientId);
      sentGestures.current.delete(shown.gestureId);
      setOpened((current) => {
        const next = new Set(current);

        next.delete(record.item.id);

        return next;
      });

      return;
    }

    const clientId = uuidv4();

    try {
      await useCases.undoStockGestureUseCase.execute({
        clientId,
        gestureId: shown.gestureId,
        ownerId: record.item.ownerId,
      });
      sentGestures.current.delete(shown.gestureId);
      await latest.current.onSettled();
    } catch (error) {
      fail(record.item, shown.gestureId, error, () => ({
        clientId,
        createdAt: Date.now(),
        itemId: record.item.id,
        itemName: record.item.description,
        kind: "UNDO",
        ownerId: record.item.ownerId,
        payload: { delta: -record.delta, gestureId: shown.gestureId },
      }));
      await latest.current.onSettled();
    }
  }

  async function onExpirationSave(date: Date) {
    const gestureId = expirationFor;

    setExpirationFor(undefined);

    const record = gestureId ? sentGestures.current.get(gestureId) : undefined;

    if (!gestureId || !record) {
      return;
    }

    const clientId = uuidv4();

    try {
      await useCases.setStockGestureExpirationUseCase.execute({
        clientId,
        expirationDate: date,
        gestureId,
        ownerId: record.item.ownerId,
      });
      await latest.current.onSettled();
    } catch (error) {
      fail(record.item, gestureId, error, () => ({
        clientId,
        createdAt: Date.now(),
        itemId: record.item.id,
        itemName: record.item.description,
        kind: "EXPIRATION",
        ownerId: record.item.ownerId,
        payload: { delta: 0, expirationDate: date.toISOString(), gestureId },
      }));
    }
  }

  async function processEntry(entry: QueueEntry) {
    try {
      if (entry.kind === "MOVEMENT") {
        await useCases.createStockMovementUseCase.execute({
          ...(entry.payload as unknown as MovementParams),
          clientId: entry.clientId,
        });
      } else if (entry.kind === "UNDO") {
        await useCases.undoStockGestureUseCase.execute({
          clientId: entry.clientId,
          gestureId: entry.payload.gestureId as string,
          ownerId: entry.ownerId,
        });
      } else {
        await useCases.setStockGestureExpirationUseCase.execute({
          clientId: entry.clientId,
          expirationDate: new Date(entry.payload.expirationDate as string),
          gestureId: entry.payload.gestureId as string,
          ownerId: entry.ownerId,
        });
      }

      return { status: "SENT" as const };
    } catch (error) {
      const failure = classifyFailure(error);

      // An undo that finds no gesture already happened (its first answer was lost): nothing left to do.
      if (
        entry.kind === "UNDO" &&
        failure.kind === "REFUSED" &&
        failure.reasonKey === "stock.offline.reasonGone"
      ) {
        return { status: "SENT" as const };
      }

      return failure.kind === "OFFLINE"
        ? { status: "OFFLINE" as const }
        : { reason: failure.reasonKey, status: "DROPPED" as const };
    }
  }

  const flush = useCallback(async () => {
    if (offlineQueue.list().length === 0) {
      return;
    }

    const result = await offlineQueue.flush(processEntry);

    if (result.sent.length === 0 && result.dropped.length === 0) {
      return;
    }

    await latest.current.onSettled();

    if (result.dropped.length > 0) {
      const first = result.dropped[0];
      const delta = Number(first.entry.payload.delta ?? 0);
      const signed = delta < 0 ? `−${Math.abs(delta)}` : `+${delta}`;
      const detail = latest.current.t("stock.offline.refusedDetail", {
        name: first.entry.itemName,
        reason: latest.current.t(first.reason as TranslationKeys),
        signed,
      });

      showNotice({
        canSetExpiration: false,
        gestureId: first.entry.clientId,
        itemId: first.entry.itemId,
        kind: "REFUSED",
        message: latest.current.t("stock.offline.refused", {
          count: result.dropped.length,
          detail,
        }),
        sent: true,
      });
    }
  }, []);

  // The notice of a sent gesture lasts 6 s.
  useEffect(() => {
    if (!notice?.sent) {
      return;
    }

    const hide = setTimeout(() => setNotice(undefined), NOTICE_MS);

    return () => clearTimeout(hide);
  }, [notice?.id, notice?.sent]);

  // The queue is retried on mount, when the app comes back and while something waits.
  useEffect(() => {
    void flush();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void flush();
      } else {
        void commit();
      }
    });

    return () => {
      subscription.remove();
      void commit();
    };
  }, []);

  useEffect(() => {
    if (queue.count === 0) {
      return;
    }

    const retry = setInterval(() => void flush(), RETRY_MS);

    return () => clearInterval(retry);
  }, [queue.count]);

  return {
    commit,
    displayQuantity,
    exact,
    expirationFor,
    expiredPrompt,
    hasExpiredValidLot: (lots?: StockDTO["lots"]) =>
      (lots ?? []).some(
        (lot) =>
          lot.expirationStatus !== StockLotStatus.EXPIRED && lot.quantity > 0,
      ),
    isOpened: (itemId: string) => opened.has(itemId),
    isPending: (itemId: string) => queue.pendingItemIds.has(itemId),
    notice,
    offlineCount: queue.count,
    onChooseExpired,
    onExactClose: () => setExact(undefined),
    onExactConfirm,
    onExactOpen: (item: StockDTO, direction: QuickDirection) =>
      setExact({ direction, item }),
    onExpirationClose: () => setExpirationFor(undefined),
    onExpirationOpen: () => setExpirationFor(notice?.gestureId),
    onExpirationSave,
    onExpiredCancel: () => setExpiredPrompt(undefined),
    onNoticeHide: () => setNotice(undefined),
    onOpen,
    onStep,
    onUndo,
    retryNow: flush,
  };
}
