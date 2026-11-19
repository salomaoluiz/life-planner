import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { ShoppingListCardEntity } from "@domain/entities/stock/ShoppingListEntity";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import ShoppingListsUIModel, {
  LISTS_FILTER_ALL,
} from "../models/ShoppingListsUIModel";

export type StockListsVM = ReturnType<typeof useStockListsViewModel>;

interface ListsData {
  cards: ShoppingListCardEntity[];
  owners: OwnerDTO[];
}

export async function fetchLists(owners: OwnerDTO[]): Promise<ListsData> {
  const cards = await useCases.getShoppingListsUseCase.execute({
    includeArchived: true,
  });

  return { cards, owners };
}

export default useStockListsViewModel;

function useStockListsViewModel() {
  const isFocused = useIsFocused();
  const { openModal } = useModalNavigation();
  const [filter, setFilter] = useState(LISTS_FILTER_ALL);
  const [archivedOpen, setArchivedOpen] = useState(false);
  const [failed, setFailed] = useState(false);

  const { data, error, isFetching, refetch } = useOwnerScopedQuery<ListsData>({
    cacheKey: [useCases.getShoppingListsUseCase.uniqueName],
    fetch: fetchLists,
  });

  useEffect(() => {
    if (isFocused) {
      refetch();
    }
  }, [isFocused]);

  const model = useMemo(
    () =>
      data ? new ShoppingListsUIModel(data.cards, data.owners) : undefined,
    [data],
  );
  const view = model?.view(filter);
  const scope = useReadOnlyScope(
    data?.owners,
    view?.filter ?? LISTS_FILTER_ALL,
  );

  // The owner the new list starts with: the family of the chip, else the person (the modal lets the user change it).
  const ownerFilterId =
    view && view.filter !== LISTS_FILTER_ALL && view.filter !== "PERSONAL"
      ? view.filter
      : undefined;

  async function onReactivate(id: string) {
    setFailed(false);

    try {
      await useCases.updateShoppingListUseCase.execute({
        id,
        status: "ACTIVE",
      });
      await refetch();
    } catch {
      setFailed(true);
    }
  }

  return {
    activeCards: view?.active ?? [],
    archivedCards: view?.archived ?? [],
    archivedOpen,
    errorMessageKey:
      error && !data ? ("stock.lists.errorLoad" as const) : undefined,
    filter: view?.filter ?? LISTS_FILTER_ALL,
    filterOptions: model?.filterOptions ?? [],
    isEmpty: !!view && view.active.length === 0 && view.archived.length === 0,
    isLoading: isFetching && !data,
    isRefreshing: isFetching && !!data,
    onArchivedToggle: () => setArchivedOpen((open) => !open),
    onCardPress: (id: string) => router.push(`/stock/list/${id}` as never),
    onFilterChange: setFilter,
    onNewPress: scope.guard(() =>
      openModal(
        "stock_shopping_list",
        ownerFilterId ? { ownerId: ownerFilterId } : undefined,
      ),
    ),
    onReactivate: scope.guard(onReactivate),
    onRefresh: async () => refetch(),
    onRetry: async () => refetch(),
    onToastHide: () => {
      scope.onToastHide();
      setFailed(false);
    },
    reactivateFailed: failed,
    readOnly: scope.readOnly,
    toastVisible: scope.toastVisible,
  };
}
