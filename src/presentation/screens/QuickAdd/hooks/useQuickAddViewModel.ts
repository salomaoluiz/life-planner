import { useEffect, useMemo, useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import useStockQuickMovement from "@screens/Stock/hooks/useStockQuickMovement";
import { fetchStock } from "@screens/Stock/hooks/useStockViewModel";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

export type QuickAddVM = ReturnType<typeof useQuickAddViewModel>;

// Spec 117 FR 16: a typed search needs 2 characters and waits 300 ms.
export const SEARCH_MIN_CHARS = 2;
export const SEARCH_DEBOUNCE_MS = 300;
const FREQUENT_LIMIT = 5;

export default useQuickAddViewModel;

function useQuickAddViewModel() {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const { closeModal, replaceModal } = useModalNavigation();
  const owners = useOwners();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const query = debounced.trim();
  const searching = query.length >= SEARCH_MIN_CHARS;

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(search), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [search]);

  // Not owner-scoped: the API knows the owners, so it loads in parallel with them (no request waterfall).
  const frequent = useQuery<StockDTO[]>({
    cacheKey: [useCases.getFrequentStockItemsUseCase.uniqueName],
    enabled: !searching,
    fetch: async () =>
      useCases.getFrequentStockItemsUseCase.execute({ limit: FREQUENT_LIMIT }),
  });
  const stock = useOwnerScopedQuery({
    cacheKey: [useCases.getStockItemsUseCase.uniqueName, "quick-add"],
    enabled: searching,
    fetch: fetchStock,
  });
  const suggestions = useQuery<string[]>({
    cacheKey: [useCases.suggestStockItemsUseCase.uniqueName, query],
    enabled: searching,
    fetch: async () =>
      (await useCases.suggestStockItemsUseCase.execute({ q: query })).map(
        (suggestion) => suggestion.id,
      ),
  });

  async function refetchAll() {
    await Promise.all([
      searching ? stock.refetch() : frequent.refetch(),
      searching ? suggestions.refetch() : Promise.resolve(),
    ]);
  }

  const quick = useStockQuickMovement({ onSettled: refetchAll });
  const locale = getLocale().languageTag;
  const rows = useMemo(() => {
    const items = searching
      ? (suggestions.data ?? [])
          .map((id) => stock.data?.items.find((item) => item.id === id))
          .filter((item): item is StockDTO => item !== undefined)
      : (frequent.data ?? []);

    return items.map(
      (item) => new StockItemUIModel(item, owners.data ?? [], locale),
    );
  }, [
    searching,
    suggestions.data,
    stock.data,
    frequent.data,
    owners.data,
    locale,
  ]);
  const isLoading = searching
    ? !suggestions.data || !stock.data
    : !frequent.data && frequent.status !== "error";

  return {
    closeLabel: t("common.actions.close"),
    isEmpty: searching && !isLoading && rows.length === 0,
    isLoading,
    // The form takes the place of the sheet in the stack: closing it returns to the screen below.
    onClose: closeModal,
    onCreateFromSearch: () =>
      replaceModal("add_new_stock_item", { description: query }),
    onSearchChange: setSearch,
    options: [
      {
        icon: "swap-vertical",
        onPress: () => replaceModal("add_new_transaction"),
        testID: "quick-add-transaction",
        title: t("navigation.quickAdd.transaction"),
      },
      {
        icon: "package-variant-closed",
        onPress: () => replaceModal("add_new_stock_item"),
        testID: "quick-add-stock-item",
        title: t("navigation.quickAdd.stockItem"),
      },
    ],
    query,
    quick,
    rows,
    search,
    searching,
    title: t("navigation.quickAdd.title"),
  };
}
