import { useLocalSearchParams } from "expo-router";
import { useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import {
  ShoppingListCardEntity,
  ShoppingListDetailEntity,
  ShoppingListStatuses,
} from "@domain/entities/stock/ShoppingListEntity";
import {
  initialInput,
  QuantityInput,
  roundQuantity,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";

export type AddToListVM = ReturnType<typeof useAddToListViewModel>;

export default useAddToListViewModel;

// Spec 118 FR 14 and 16: "Adicionar à lista" from the item (detail and row menu). The list starts as the item's
// effective one and the quantity as what is missing to the ideal (1 without an ideal).
function useAddToListViewModel() {
  const { closeModal } = useModalNavigation();
  const { getLocale } = useTranslationLocale();
  const params = useLocalSearchParams<{ itemId: string }>();
  const locale = getLocale().languageTag;

  const item = useQuery<StockDTO>({
    cacheKey: [useCases.getStockItemUseCase.uniqueName, params.itemId],
    fetch: async () =>
      useCases.getStockItemUseCase.execute({ id: params.itemId }),
  });
  const lists = useQuery<ShoppingListCardEntity[]>({
    cacheKey: [
      useCases.getShoppingListsUseCase.uniqueName,
      "owner",
      item.data?.ownerId ?? "",
    ],
    enabled: !!item.data && !item.data.stockOnly,
    fetch: async () =>
      useCases.getShoppingListsUseCase.execute({
        ownerId: item.data?.ownerId,
      }),
  });

  const [listId, setListId] = useState<string | undefined>();
  const [quantity, setQuantity] = useState<QuantityInput | undefined>();
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const options = (lists.data ?? []).filter(
    (card) =>
      card.status === ShoppingListStatuses.ACTIVE &&
      card.ownerId === item.data?.ownerId,
  );
  const effective = item.data?.effectiveShoppingListId;
  const selectedListId =
    listId ??
    (options.some((card) => card.id === effective) ? effective : undefined) ??
    options.find((card) => card.isDefault)?.id;
  const selectedList = options.find((card) => card.id === selectedListId);

  const target = useQuery<ShoppingListDetailEntity>({
    cacheKey: [
      useCases.getShoppingListUseCase.uniqueName,
      selectedListId ?? "",
    ],
    enabled: !!selectedListId,
    fetch: async () =>
      useCases.getShoppingListUseCase.execute({ id: selectedListId as string }),
  });

  const suggested =
    item.data &&
    item.data.idealQuantity !== undefined &&
    item.data.restockQuantity > 0
      ? item.data.restockQuantity
      : 1;
  const currentQuantity =
    quantity ??
    initialInput(
      roundQuantity(suggested),
      item.data?.unit ?? ("unit" as never),
    );
  const parsed = item.data
    ? toQuantity(currentQuantity, item.data.unit)
    : undefined;
  const existing = target.data?.groups
    .flatMap((group) => group.rows)
    .find((row) => row.itemId === params.itemId);

  function display(value: number) {
    if (!item.data) {
      return "";
    }

    const shown = formatQuantity(value, item.data.unit, locale);

    return `${shown.text}`;
  }

  async function onSubmit() {
    if (!item.data || !selectedListId || parsed === undefined || parsed <= 0) {
      setFailed(true);

      return;
    }

    setSaving(true);
    setFailed(false);

    try {
      await useCases.addShoppingListRowUseCase.execute({
        itemId: item.data.id,
        listId: selectedListId,
        quantity: parsed,
      });
      await invalidateFetcherData([
        useCases.getShoppingListsUseCase.uniqueName,
      ]);
      closeModal();
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return {
    failed,
    isLoading:
      (item.isFetching && !item.data) || (lists.isFetching && !lists.data),
    item: item.data,
    listOptions: options.map((card) => ({
      label: card.id === effective ? card.name : card.name,
      value: card.id,
    })),
    merge:
      existing && selectedList && parsed !== undefined
        ? {
            list: selectedList.name,
            quantity: display(existing.quantity),
            total: display(roundQuantity(existing.quantity + parsed)),
          }
        : undefined,
    notOffered: !!item.data?.stockOnly,
    onClose: closeModal,
    onListChange: setListId,
    onQuantityChange: setQuantity,
    onSubmit,
    quantity: currentQuantity,
    saving,
    selectedListId,
  };
}
