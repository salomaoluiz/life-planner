import { useEffect, useMemo, useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import StockMovementDTO from "@application/dto/stock/StockMovementDTO";
import { useCases } from "@application/useCases";
import { StockMovementTypes } from "@domain/entities/stock/StockMovementEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

import StockItemDetailsUIModel from "../models/StockItemDetailsUIModel";

export interface Props {
  item: StockItemUIModel;
  onClose: () => void;
  onDeleted: () => void;
}

interface MovementsPage {
  items: StockMovementDTO[];
  nextCursor?: string;
}

function useStockItemDetailsViewModel(props: Props) {
  const { getLocale } = useTranslationLocale();
  const { openModal } = useModalNavigation();
  const owners = useOwners();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [extraPages, setExtraPages] = useState<MovementsPage[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const id = props.item.id;

  const detail = useQuery<StockDTO>({
    cacheKey: [useCases.getStockItemUseCase.uniqueName, id],
    fetch: async () => useCases.getStockItemUseCase.execute({ id }),
  });
  const firstPage = useQuery<MovementsPage>({
    cacheKey: [useCases.getStockMovementsUseCase.uniqueName, id],
    fetch: async () =>
      useCases.getStockMovementsUseCase.execute({ itemId: id }),
  });
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteStockItemUseCase.uniqueName],
    fetch: useCases.deleteStockItemUseCase.execute,
  });

  // A movement refreshes the first page: the pages loaded after it are stale.
  useEffect(() => {
    setExtraPages([]);
  }, [firstPage.data]);

  useEffect(() => {
    if (deleteItem.status === "success") {
      setIsConfirmOpen(false);
      props.onDeleted();
    }

    if (deleteItem.status === "error") {
      setIsConfirmOpen(false);
    }
  }, [deleteItem.status]);

  const locale = getLocale().languageTag;
  const model = useMemo(
    () =>
      detail.data
        ? new StockItemDetailsUIModel(detail.data, owners.data ?? [], locale)
        : undefined,
    [detail.data, owners.data, locale],
  );
  const pages = firstPage.data ? [firstPage.data, ...extraPages] : [];
  const nextCursor = pages.length
    ? pages[pages.length - 1].nextCursor
    : undefined;
  const history = model?.history(pages.flatMap((page) => page.items)) ?? [];
  const params = { itemId: id, ownerId: props.item.ownerId };

  async function onLoadMore() {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    try {
      const page = await useCases.getStockMovementsUseCase.execute({
        cursor: nextCursor,
        itemId: id,
      });

      setExtraPages((current) => [...current, page]);
    } finally {
      setIsLoadingMore(false);
    }
  }

  function onConfirmDelete() {
    if (deleteItem.isFetching) {
      return;
    }

    deleteItem.mutate({ id, ownerId: props.item.ownerId });
  }

  function openMovement(type: StockMovementTypes, lotId?: string) {
    openModal("stock_movement", { ...params, lotId, type });
  }

  return {
    errorKey:
      deleteItem.status === "error"
        ? ("common.errors.generic" as const)
        : undefined,
    hasMore: !!nextCursor,
    history,
    isConfirmOpen,
    isDeleting: deleteItem.isFetching,
    isHistoryLoading: firstPage.isFetching && !firstPage.data,
    isLoading: detail.isFetching && !detail.data,
    isLoadingMore,
    loadErrorKey:
      detail.error && !detail.data
        ? ("stock.details.error" as const)
        : undefined,
    model,
    onAdjust: () => openMovement(StockMovementTypes.ADJUST),
    onCancelDelete: () => setIsConfirmOpen(false),
    onConfirmDelete,
    onConsume: () => openMovement(StockMovementTypes.CONSUME),
    onDeletePress: () => setIsConfirmOpen(true),
    onDiscard: (lotId: string) =>
      openMovement(StockMovementTypes.DISCARD, lotId),
    onEdit: () => openModal("add_new_stock_item", params),
    onEntry: () => openMovement(StockMovementTypes.ENTRY),
    onLoadMore,
    onOpen: () => openMovement(StockMovementTypes.OPEN),
    onRetry: async () => detail.refetch(),
  };
}

export default useStockItemDetailsViewModel;
