import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import { toCurrencyCode } from "@domain/entities/financial/Currency";
import {
  ShoppingListDetailEntity,
  ShoppingListRowEntity,
  ShoppingListRowOrigins,
} from "@domain/entities/stock/ShoppingListEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import {
  initialInput,
  QuantityInput,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { useTranslationLocale } from "@presentation/i18n";
import { isArchivedOwner } from "@screens/Financial/models/ownerOptions";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import ShoppingListDetailUIModel from "../models/ShoppingListDetailUIModel";

const SEARCH_DEBOUNCE_MS = 300;
const MIN_SEARCH_LENGTH = 2;
const UNDO_NOTICE_MS = 5000;
export const ADD_AS_TEXT_ID = "__text__";

export type StockListDetailVM = ReturnType<typeof useStockListDetailViewModel>;

interface Removed {
  // The row of an item still below its minimum comes back by itself on the next consumption.
  comesBack: boolean;
  row: ShoppingListRowEntity;
}

// A list that is missing or not readable answers 404 (no data leaks): "Lista não encontrada".
function isNotFound(error: unknown) {
  if (!(error instanceof GenericError)) {
    return false;
  }

  const cause = error.context.error as undefined | { statusCode?: number };

  return cause?.statusCode === 404;
}

export default useStockListDetailViewModel;

function useStockListDetailViewModel() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isFocused = useIsFocused();
  const { openModal } = useModalNavigation();
  const { getLocale } = useTranslationLocale();
  const owners = useOwners();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<QuantityInput>(
    initialInput(undefined, StockUnits.UNIT),
  );
  const [priceCents, setPriceCents] = useState(0);
  const [description, setDescription] = useState("");
  const [removed, setRemoved] = useState<Removed | undefined>();
  const [mergedMessage, setMergedMessage] = useState<
    undefined | { list: string; quantity: number; unit: StockUnits }
  >();
  const [failed, setFailed] = useState(false);

  const detail = useQuery<ShoppingListDetailEntity>({
    cacheKey: [useCases.getShoppingListUseCase.uniqueName, id ?? ""],
    enabled: !!id,
    fetch: async () => useCases.getShoppingListUseCase.execute({ id }),
  });

  useEffect(() => {
    if (isFocused) {
      detail.refetch();
    }
  }, [isFocused]);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );

    return () => clearTimeout(timeout);
  }, [search]);

  const list = detail.data?.list;
  const suggestions = useQuery({
    cacheKey: [
      useCases.suggestStockItemsUseCase.uniqueName,
      "list",
      list?.ownerId ?? "",
      debouncedSearch,
    ],
    enabled: !!list && debouncedSearch.length >= MIN_SEARCH_LENGTH,
    fetch: async () =>
      useCases.suggestStockItemsUseCase.execute({
        owner: list?.owner,
        ownerId: list?.ownerId,
        q: debouncedSearch,
      }),
  });

  const model = useMemo(
    () =>
      detail.data ? new ShoppingListDetailUIModel(detail.data) : undefined,
    [detail.data],
  );
  const ownerList = owners.data;
  const owner = ownerList?.find((candidate) => candidate.id === list?.ownerId);
  const readOnly =
    !!ownerList && !!list && isArchivedOwner(ownerList, list.ownerId);
  const selectedRow = model?.rows.find((row) => row.id === selectedId);

  useEffect(() => {
    if (selectedRow) {
      setQuantity(
        initialInput(selectedRow.entity.quantity, selectedRow.entity.unit),
      );
      setPriceCents(selectedRow.entity.unitPriceCents ?? 0);
      setDescription(selectedRow.entity.description);
    }
  }, [selectedId]);

  async function run(action: () => Promise<void>) {
    setFailed(false);

    try {
      await action();
      await detail.refetch();
    } catch {
      setFailed(true);
    }
  }

  async function onAddItem(itemId: string) {
    if (!list) {
      return;
    }

    await run(async () => {
      const result = await useCases.addShoppingListRowUseCase.execute({
        itemId,
        listId: list.id,
        quantity: 1,
      });

      setMergedMessage(
        result.merged
          ? {
              list: list.name,
              quantity: result.row.quantity,
              unit: result.row.unit,
            }
          : undefined,
      );
    });
    setSearch("");
  }

  async function onAddText(text: string) {
    if (!list || text.trim() === "") {
      return;
    }

    await run(async () => {
      await useCases.addShoppingListRowUseCase.execute({
        description: text.trim(),
        listId: list.id,
        quantity: 1,
        unit: StockUnits.UNIT,
      });
      setMergedMessage(undefined);
    });
    setSearch("");
  }

  async function onRemove(row: ShoppingListRowEntity) {
    setSelectedId(undefined);
    await run(async () => {
      await useCases.deleteShoppingListRowUseCase.execute({ rowId: row.id });
      setRemoved({
        comesBack:
          !!row.itemId &&
          row.stock?.minQuantity !== undefined &&
          row.stock.quantity <= row.stock.minQuantity,
        row,
      });
    });
  }

  // Spec 118 FR 18: the undo re-creates the row with its previous values and origin; the API clears the dismissal.
  async function onUndo() {
    if (!list || !removed) {
      return;
    }

    const { row } = removed;

    setRemoved(undefined);
    await run(async () => {
      await useCases.addShoppingListRowUseCase.execute(
        row.itemId
          ? {
              itemId: row.itemId,
              listId: list.id,
              origin: row.origin as ShoppingListRowOrigins,
              quantity: row.quantity,
              restore: true,
            }
          : {
              description: row.description,
              estimatedUnitPriceCents: row.unitPriceCents,
              listId: list.id,
              quantity: row.quantity,
              unit: row.unit,
            },
      );
    });
  }

  async function onRowSave() {
    if (!selectedRow) {
      return;
    }

    const entity = selectedRow.entity;
    const parsed = toQuantity(quantity, entity.unit);

    if (parsed === undefined || parsed <= 0) {
      setFailed(true);

      return;
    }

    setSelectedId(undefined);
    await run(async () => {
      await useCases.updateShoppingListRowUseCase.execute({
        description: selectedRow.isText ? description.trim() : undefined,
        estimatedUnitPriceCents: priceCents > 0 ? priceCents : null,
        id: entity.id,
        quantity: parsed,
      });
    });
  }

  const addSuggestions = [
    ...(debouncedSearch.length >= MIN_SEARCH_LENGTH
      ? (suggestions.data ?? []).map((suggestion) => ({
          id: suggestion.id,
          label: suggestion.description,
          meta: suggestion.brand,
        }))
      : []),
    ...(search.trim().length > 0
      ? [{ id: ADD_AS_TEXT_ID, label: search.trim() }]
      : []),
  ];

  return {
    addSuggestions,
    currency: toCurrencyCode(list?.currency),
    description,
    errorMessageKey:
      detail.error && !detail.data && !isNotFound(detail.error)
        ? ("stock.lists.errorLoad" as const)
        : undefined,
    failed,
    isLoading: detail.isFetching && !detail.data,
    isNotFound: isNotFound(detail.error) && !detail.data,
    languageTag: getLocale().languageTag,
    list,
    mergedMessage,
    model,
    onBack: () => router.replace("/stock/lists" as never),
    onDescriptionChange: setDescription,
    onEditList: () => openModal("stock_shopping_list", { id }),
    onFailedHide: () => setFailed(false),
    onMergedHide: () => setMergedMessage(undefined),
    onNoticeHide: () => setRemoved(undefined),
    onPriceChange: setPriceCents,
    onQuantityChange: setQuantity,
    onRemove,
    onRetry: async () => detail.refetch(),
    onRowClose: () => setSelectedId(undefined),
    onRowPress: (rowId: string) => {
      if (!readOnly) {
        setSelectedId(rowId);
      }
    },
    onRowSave,
    onSearchChange: setSearch,
    onSelectSuggestion: async (suggestionId: string, label: string) =>
      suggestionId === ADD_AS_TEXT_ID
        ? onAddText(label)
        : onAddItem(suggestionId),
    onUndo,
    ownerName: owner?.type === OwnerType.FAMILY ? owner.name : undefined,
    priceCents,
    quantity,
    readOnly,
    removed: removed
      ? { comesBack: removed.comesBack, name: removed.row.description }
      : undefined,
    search,
    selectedRow,
    undoDurationMs: UNDO_NOTICE_MS,
  };
}
