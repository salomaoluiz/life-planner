import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { AppState } from "react-native";

import { useCases } from "@application/useCases";
import { toCurrencyCode } from "@domain/entities/financial/Currency";
import {
  PurchaseRowEntity,
  PurchaseRowStates,
  PurchaseStatuses,
} from "@domain/entities/stock/PurchaseEntity";
import { ShoppingListDetailEntity } from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { useQuery } from "@infrastructure/fetcher";
import { purchaseQueue, QueueEntry } from "@infrastructure/offlineQueue";
import { subscribeToEvents } from "@infrastructure/sse";
import { uuidv4 } from "@infrastructure/uuid";
import { useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { classifyFailure } from "@screens/Stock/models/quickMovementErrors";

import {
  buildPurchaseModel,
  CartRow,
  PurchaseModel,
  ToBuyRow,
} from "../models/PurchaseUIModel";

export type PurchaseVM = ReturnType<typeof usePurchaseViewModel>;

export interface SheetState {
  description: string;
  expiration: string;
  isNew: boolean;
  listRowId?: string;
  priceCents: number;
  priceInput: "LINE" | "UNIT";
  purchaseRowId?: string;
  quantity: string;
  // The purchase row being edited (a cart row), or the one a list row will become.
  rowId: string;
  unit: StockUnits;
}

const REFETCH_DEBOUNCE_MS = 400;
const QUEUE_KINDS = [
  "PURCHASE_DISCARD",
  "PURCHASE_END",
  "PURCHASE_ROW",
  "PURCHASE_ROW_DELETE",
];

// dd/mm/yyyy (or mm/yyyy: the last day of the month is not guessed, the first is) → an ISO day, or undefined.
export function parseExpiration(text: string): null | string | undefined {
  const value = text.trim();

  if (value === "") {
    return null;
  }

  const full = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  const month = /^(\d{1,2})\/(\d{4})$/.exec(value);
  let parts = [0, 0, 0];

  if (full) {
    parts = [Number(full[1]), Number(full[2]), Number(full[3])];
  } else if (month) {
    parts = [1, Number(month[1]), Number(month[2])];
  }

  const [day, monthNumber, year] = parts;

  if (!year || monthNumber < 1 || monthNumber > 12 || day < 1 || day > 31) {
    return undefined;
  }

  return `${year}-${String(monthNumber).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function priceFields(sheet: SheetState) {
  if (sheet.priceCents <= 0) {
    return {};
  }

  return sheet.priceInput === "UNIT"
    ? { unitPriceCents: sheet.priceCents }
    : { lineTotalCents: sheet.priceCents };
}

function toOverlayRow(entry: QueueEntry): PurchaseRowEntity {
  const payload = entry.payload as Record<string, unknown>;

  return {
    checkedAt: new Date(entry.createdAt).toISOString(),
    description: entry.itemName,
    expirationDate: (payload.expirationDate as string | undefined) ?? undefined,
    id: entry.itemId,
    lineTotalCents: (payload.lineTotalCents as number | undefined) ?? undefined,
    listRowId: payload.listRowId as string | undefined,
    priceInput: payload.priceInput as PurchaseRowEntity["priceInput"],
    quantity: (payload.quantity as number | undefined) ?? undefined,
    state: (payload.state as PurchaseRowStates) ?? PurchaseRowStates.IN_CART,
    unit: payload.unit as StockUnits | undefined,
    unitPriceCents: (payload.unitPriceCents as number | undefined) ?? undefined,
    unknownPrice: false,
  };
}

function usePurchaseViewModel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { openModal } = useModalNavigation();
  const isFocused = useIsFocused();
  const { getLocale } = useTranslationLocale();
  const [search, setSearch] = useState("");
  const [sheet, setSheet] = useState<SheetState | undefined>();
  const [notice, setNotice] = useState<string | undefined>();
  const [failed, setFailed] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const refetchTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const view = useQuery({
    cacheKey: [useCases.getPurchaseUseCase.uniqueName, id ?? ""],
    enabled: !!id,
    fetch: async () => useCases.getPurchaseUseCase.execute({ id }),
  });
  const listId = view.data?.purchase.listId;
  const detail = useQuery<ShoppingListDetailEntity>({
    cacheKey: [useCases.getShoppingListUseCase.uniqueName, listId ?? ""],
    enabled: !!listId,
    fetch: async () =>
      useCases.getShoppingListUseCase.execute({ id: listId as string }),
  });
  const entries = useSyncExternalStore(
    purchaseQueue.subscribe,
    purchaseQueue.getSnapshot,
    purchaseQueue.getSnapshot,
  );
  const mine = useMemo(
    () => entries.filter((entry) => entry.ownerId === id),
    [entries, id],
  );
  const { overlay, pending } = useMemo(() => {
    const rows = new Map<string, PurchaseRowEntity | undefined>();

    for (const entry of mine) {
      if (entry.kind === "PURCHASE_ROW") {
        rows.set(entry.itemId, toOverlayRow(entry));
      } else if (entry.kind === "PURCHASE_ROW_DELETE") {
        rows.set(entry.itemId, undefined);
      }
    }

    return {
      overlay: rows,
      pending: new Set(
        mine
          .filter((entry) => QUEUE_KINDS.includes(entry.kind))
          .map((entry) => entry.itemId),
      ),
    };
  }, [mine]);
  function queuedStatusOf() {
    if (mine.some((entry) => entry.kind === "PURCHASE_END")) {
      return PurchaseStatuses.ENDED;
    }

    return mine.some((entry) => entry.kind === "PURCHASE_DISCARD")
      ? PurchaseStatuses.DISCARDED
      : undefined;
  }

  const queuedStatus = queuedStatusOf();

  const model: PurchaseModel | undefined = useMemo(
    () =>
      view.data
        ? buildPurchaseModel({
            detail: detail.data,
            overlay,
            pending,
            view: view.data,
          })
        : undefined,
    [view.data, detail.data, overlay, pending],
  );

  const refetchSoon = useCallback(() => {
    clearTimeout(refetchTimer.current);
    refetchTimer.current = setTimeout(() => {
      void view.refetch();
      void detail.refetch();
    }, REFETCH_DEBOUNCE_MS);
  }, [view.refetch, detail.refetch]);

  async function processEntry(entry: QueueEntry) {
    const payload = entry.payload as Record<string, unknown>;

    try {
      if (entry.kind === "PURCHASE_ROW") {
        await useCases.upsertPurchaseRowUseCase.execute({
          ...(payload as Record<string, unknown>),
          clientId: entry.clientId,
          purchaseId: entry.ownerId,
          rowId: entry.itemId,
        });
      } else if (entry.kind === "PURCHASE_ROW_DELETE") {
        await useCases.deletePurchaseRowUseCase.execute({
          clientId: entry.clientId,
          purchaseId: entry.ownerId,
          rowId: entry.itemId,
        });
      } else {
        await useCases.changePurchaseStatusUseCase.execute({
          action: entry.kind === "PURCHASE_END" ? "END" : "DISCARD",
          clientId: entry.clientId,
          id: entry.ownerId,
        });
      }

      return { status: "SENT" as const };
    } catch (error) {
      const failure = classifyFailure(error);

      return failure.kind === "OFFLINE"
        ? { status: "OFFLINE" as const }
        : { reason: failure.reasonKey, status: "DROPPED" as const };
    }
  }

  const flush = useCallback(async () => {
    if (purchaseQueue.list().length === 0) {
      return;
    }

    const result = await purchaseQueue.flush(processEntry);

    if (result.sent.length > 0 || result.dropped.length > 0) {
      await view.refetch();
    }
    if (result.dropped.length > 0) {
      setFailed(true);
    }
  }, [id]);

  useEffect(() => {
    if (isFocused) {
      void flush();
      void view.refetch();
    }
  }, [isFocused]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        void flush();
        void view.refetch();
      }
    });

    return () => subscription.remove();
  }, [flush]);

  // Spec 120 FR 23-25: the events of the list while the shopping mode is open; no polling timer exists.
  useEffect(() => {
    if (!isFocused || !listId) {
      return undefined;
    }

    const stop = subscribeToEvents({
      onMessage: refetchSoon,
      onResync: refetchSoon,
      onStatus: (status) => {
        if (status === "CONNECTED") {
          void flush();
        }
      },
      path: `/v1/stock/shopping-lists/${encodeURIComponent(listId)}/events`,
    });

    return () => {
      stop();
      clearTimeout(refetchTimer.current);
    };
  }, [isFocused, listId]);

  // A write goes straight to the API; no connection (or an earlier write still queued) keeps it in the queue.
  async function write(
    kind: QueueEntry["kind"],
    rowId: string,
    name: string,
    payload: Record<string, unknown>,
    send: (clientId: string) => Promise<void>,
  ) {
    const clientId = uuidv4();
    const entry: QueueEntry = {
      clientId,
      createdAt: Date.now(),
      itemId: rowId,
      itemName: name,
      kind,
      ownerId: id,
      payload,
    };

    setFailed(false);

    if (purchaseQueue.list().some((queued) => queued.ownerId === id)) {
      purchaseQueue.enqueue(entry);
      void flush();

      return;
    }

    try {
      await send(clientId);
      await view.refetch();
    } catch (error) {
      if (classifyFailure(error).kind === "OFFLINE") {
        purchaseQueue.enqueue(entry);
      } else {
        setFailed(true);
        await view.refetch();
      }
    }
  }

  async function saveRow(params: {
    description: string;
    expirationDate?: null | string;
    lineTotalCents?: number;
    listRowId?: string;
    priceInput?: "LINE" | "UNIT";
    quantity?: number;
    rowId: string;
    state?: PurchaseRowStates;
    unit: StockUnits;
    unitPriceCents?: number;
  }) {
    const { description, rowId, ...rest } = params;
    const payload = {
      ...rest,
      description: rest.listRowId ? undefined : description,
      unit: rest.listRowId ? undefined : rest.unit,
    };

    await write(
      "PURCHASE_ROW",
      rowId,
      description,
      payload,
      async (clientId) => {
        const result = await useCases.upsertPurchaseRowUseCase.execute({
          ...payload,
          clientId,
          purchaseId: id,
          rowId,
        } as never);

        if (result.conflict) {
          setNotice(
            result.conflict.userName
              ? `${result.row.description}|${result.conflict.userName}`
              : result.row.description,
          );
        }
      },
    );
  }

  function onTick(row: ToBuyRow) {
    if (row.otherCart || !view.data) {
      return;
    }

    setSheet({
      description: row.description,
      expiration: "",
      isNew: true,
      listRowId: row.listRowId,
      priceCents: row.lastUnitPriceCents ?? 0,
      priceInput: "UNIT",
      purchaseRowId: row.purchaseRowId,
      quantity: String(row.quantity).replace(".", ","),
      rowId: row.purchaseRowId ?? uuidv4(),
      unit: row.unit,
    });
  }

  function onCartRowPress(row: CartRow) {
    setSheet({
      description: row.description,
      expiration: row.expirationDate ?? "",
      isNew: false,
      listRowId: row.listRowId,
      priceCents: row.unitPriceCents ?? 0,
      priceInput: "UNIT",
      quantity:
        row.quantity === undefined
          ? ""
          : String(row.quantity).replace(".", ","),
      rowId: row.id,
      unit: row.unit ?? StockUnits.UNIT,
    });
  }

  function onAddOutside() {
    const text = search.trim();

    if (text.length < 2) {
      return;
    }

    setSheet({
      description: text,
      expiration: "",
      isNew: true,
      priceCents: 0,
      priceInput: "UNIT",
      quantity: "1",
      rowId: uuidv4(),
      unit: StockUnits.UNIT,
    });
    setSearch("");
  }

  async function onSheetSave() {
    const current = sheet;

    if (!current) {
      return;
    }

    const quantity = Number(current.quantity.replace(",", "."));
    const expirationDate = parseExpiration(current.expiration);

    setSheet(undefined);
    await saveRow({
      description: current.description,
      expirationDate: expirationDate === undefined ? undefined : expirationDate,
      listRowId: current.listRowId,
      priceInput: current.priceCents > 0 ? current.priceInput : undefined,
      quantity:
        Number.isFinite(quantity) && quantity > 0 ? quantity : undefined,
      rowId: current.rowId,
      state: PurchaseRowStates.IN_CART,
      unit: current.unit,
      ...priceFields(current),
    });
  }

  async function onSheetNotFound() {
    const current = sheet;

    if (!current?.listRowId) {
      return;
    }

    setSheet(undefined);
    await saveRow({
      description: current.description,
      listRowId: current.listRowId,
      rowId: current.rowId,
      state: PurchaseRowStates.NOT_FOUND,
      unit: current.unit,
    });
  }

  async function onNotFound(row: ToBuyRow) {
    await saveRow({
      description: row.description,
      listRowId: row.listRowId,
      rowId: row.purchaseRowId ?? uuidv4(),
      state: PurchaseRowStates.NOT_FOUND,
      unit: row.unit,
    });
  }

  async function onUndoNotFound(row: ToBuyRow) {
    if (!row.purchaseRowId) {
      return;
    }

    await write(
      "PURCHASE_ROW_DELETE",
      row.purchaseRowId,
      row.description,
      {},
      async (clientId) =>
        useCases.deletePurchaseRowUseCase.execute({
          clientId,
          purchaseId: id,
          rowId: row.purchaseRowId as string,
        }),
    );
  }

  async function onSheetRemove() {
    const current = sheet;

    setSheet(undefined);

    if (!current || current.isNew) {
      return;
    }

    await write(
      "PURCHASE_ROW_DELETE",
      current.rowId,
      current.description,
      {},
      async (clientId) =>
        useCases.deletePurchaseRowUseCase.execute({
          clientId,
          purchaseId: id,
          rowId: current.rowId,
        }),
    );
  }

  async function changeStatus(action: "DISCARD" | "END") {
    const kind = action === "END" ? "PURCHASE_END" : "PURCHASE_DISCARD";

    await write(kind, id, id, {}, async (clientId) => {
      await useCases.changePurchaseStatusUseCase.execute({
        action,
        clientId,
        id,
      });
    });
  }

  const status = queuedStatus ?? view.data?.purchase.status;
  const closingBy = view.data?.purchase.closing?.by;

  return {
    cartCount: model?.cart.length ?? 0,
    closingBy,
    confirmDiscard,
    currency: toCurrencyCode(view.data?.purchase.currency),
    errorMessageKey:
      view.error && !view.data
        ? ("stock.purchase.errorLoad" as const)
        : undefined,
    failed,
    isEnded: status === PurchaseStatuses.ENDED,
    isLoading: view.isFetching && !view.data,
    isOpen: status === PurchaseStatuses.OPEN,
    languageTag: getLocale().languageTag,
    model,
    notice,
    offlineCount: mine.length,
    onAddOutside,
    onBack: () =>
      router.replace(
        (listId ? `/stock/list/${listId}` : "/stock/lists") as never,
      ),
    onCartRowPress,
    onClose: () => router.push(`/stock/purchase-close/${id}` as never),
    onDiscard: async () => {
      setConfirmDiscard(false);
      await changeStatus("DISCARD");
      router.replace(
        (listId ? `/stock/list/${listId}` : "/stock/lists") as never,
      );
    },
    onDiscardAsk: () =>
      model && model.cart.length > 0
        ? setConfirmDiscard(true)
        : void (async () => {
            await changeStatus("DISCARD");
            router.replace(
              (listId ? `/stock/list/${listId}` : "/stock/lists") as never,
            );
          })(),
    onDiscardCancel: () => setConfirmDiscard(false),
    onEnd: async () => changeStatus("END"),
    onFailedHide: () => setFailed(false),
    onNotFound,
    onNoticeHide: () => setNotice(undefined),
    onReopen: async () => {
      await useCases.changePurchaseStatusUseCase.execute({
        action: "REOPEN",
        id,
      });
      await view.refetch();
    },
    onRetry: async () => view.refetch(),
    // Spec 121 FR 25: the reader adds a row by code to this purchase.
    onScanPress: () => openModal("stock_barcode", { purchaseId: id }),
    onSearchChange: setSearch,
    onSheetChange: (patch: Partial<SheetState>) =>
      setSheet((current) => (current ? { ...current, ...patch } : current)),
    onSheetClose: () => setSheet(undefined),
    onSheetNotFound,
    onSheetRemove,
    onSheetSave,
    onTick,
    onUndoNotFound,
    purchase: view.data,
    search,
    sheet,
    visibleToBuy: model
      ? model.toBuy.filter(
          (row) =>
            search.trim().length < 2 ||
            row.description.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : [],
  };
}

export default usePurchaseViewModel;
