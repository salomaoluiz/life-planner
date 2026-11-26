import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import {
  StockLotAlreadyOpen,
  StockNotEnoughQuantity,
} from "@domain/entities/errors";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import {
  initialInput,
  QuantityInput,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import StockMovementUIModel from "../models/StockMovementUIModel";

export type StockMovementVM = ReturnType<typeof useStockMovementViewModel>;

const AUTO_LOT = "";

export default useStockMovementViewModel;

function useStockMovementViewModel() {
  const { closeModal } = useModalNavigation();
  const { getLocale } = useTranslationLocale();
  const params = useLocalSearchParams<{
    itemId: string;
    lotId?: string;
    ownerId: string;
    type: string;
  }>();
  const type = (params.type as StockMovementTypes) ?? StockMovementTypes.ENTRY;
  const locale = getLocale().languageTag;

  const item = useQuery<StockDTO>({
    cacheKey: [useCases.getStockItemUseCase.uniqueName, params.itemId],
    fetch: async () =>
      useCases.getStockItemUseCase.execute({ id: params.itemId }),
  });
  const movement = useMutation({
    cacheKey: [useCases.createStockMovementUseCase.uniqueName],
    fetch: useCases.createStockMovementUseCase.execute,
  });

  const model = useMemo(
    () =>
      item.data ? new StockMovementUIModel(item.data, type, locale) : undefined,
    [item.data, type, locale],
  );

  const [quantity, setQuantity] = useState<QuantityInput | undefined>();
  const [lotId, setLotId] = useState<string | undefined>();
  const [reason, setReason] = useState<string | undefined>();
  const [expirationDate, setExpirationDate] = useState<Date | undefined>();
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>();
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // The defaults come with the item: 1 to open, the whole lot to discard, the lot of the shortcut.
  const defaults = useMemo(() => {
    function defaultReason() {
      if (type !== StockMovementTypes.DISCARD) {
        return "PURCHASE";
      }

      return model?.lotById(params.lotId ?? model.defaultDiscardLotId())
        ?.expirationStatus === "EXPIRED"
        ? "EXPIRED"
        : "OTHER";
    }

    if (!model) {
      return undefined;
    }

    const discardLot =
      type === StockMovementTypes.DISCARD
        ? (params.lotId ?? model.defaultDiscardLotId())
        : undefined;
    const lot = params.lotId ?? discardLot ?? AUTO_LOT;

    return {
      lotId: lot,
      quantity: initialInput(
        model.initialQuantity(discardLot ?? params.lotId),
        model.unit,
      ),
      reason: defaultReason(),
    };
  }, [model, params.lotId, type]);

  const input = quantity ?? defaults?.quantity;
  const chosenLot = lotId ?? defaults?.lotId;
  const chosenReason = reason ?? defaults?.reason;
  // The automatic choice is an empty value in the select and no lot for the API.
  const lotParam = chosenLot === "" ? undefined : chosenLot;
  const value = input && model ? toQuantity(input, model.unit) : undefined;
  const isAdjust = type === StockMovementTypes.ADJUST;
  const quantityError: TranslationKeys | undefined =
    submitted && (value === undefined || (!isAdjust && value <= 0))
      ? "stock.movement.errors.invalid"
      : undefined;

  useEffect(() => {
    if (movement.status === "success") {
      void invalidateFetcherData([useCases.getStockItemUseCase.uniqueName]);
      void invalidateFetcherData([
        useCases.getStockMovementsUseCase.uniqueName,
      ]);
      closeModal();
    }
  }, [movement.status]);

  function onSave() {
    setSubmitted(true);

    if (movement.isFetching || !model || value === undefined) {
      return;
    }

    if (!isAdjust && value <= 0) {
      return;
    }

    movement.mutate({
      countedQuantity: isAdjust ? value : undefined,
      expirationDate,
      itemId: params.itemId,
      lotId: lotParam,
      note: note.trim() || undefined,
      ownerId: params.ownerId,
      purchaseDate,
      quantity: isAdjust ? undefined : value,
      reason: model.showsReason ? chosenReason : undefined,
      type,
    });
  }

  function errorKey(): TranslationKeys | undefined {
    if (movement.status !== "error") {
      return undefined;
    }

    if (movement.error instanceof StockNotEnoughQuantity) {
      return "stock.movement.errors.notEnough";
    }

    if (movement.error instanceof StockLotAlreadyOpen) {
      return "stock.movement.errors.alreadyOpen";
    }

    return "common.errors.generic";
  }

  return {
    chosenLot: chosenLot ?? AUTO_LOT,
    chosenReason,
    discardValue:
      type === StockMovementTypes.DISCARD
        ? model?.discardValue(lotParam, value)
        : undefined,
    errorKey: errorKey(),
    expirationDate,
    input,
    isLoading: item.isFetching && !item.data,
    isSaving: movement.isFetching,
    loadErrorKey:
      item.error && !item.data
        ? ("stock.movement.loadError" as const)
        : undefined,
    model,
    note,
    onClose: () => closeModal(),
    onLotChange: setLotId,
    onNoteChange: setNote,
    onQuantityChange: setQuantity,
    onReasonChange: setReason,
    onRetry: async () => item.refetch(),
    onSave,
    openPreview: model?.openPreview(lotParam, value),
    purchaseDate,
    quantityError,
    setExpirationDate,
    setPurchaseDate,
    type,
  };
}
