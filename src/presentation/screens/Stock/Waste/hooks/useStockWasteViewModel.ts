import { useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { WasteEntity } from "@domain/entities/stock/StockWasteEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import { useTranslationLocale } from "@presentation/i18n";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";

import WasteUIModel, {
  currentMonthKey,
  shiftMonth,
  WASTE_OWNER_ALL,
} from "../models/WasteUIModel";

export type StockWasteTab = "category" | "items" | "reason";
export type StockWasteVM = ReturnType<typeof useStockWasteViewModel>;

export default useStockWasteViewModel;

// Spec 123 FR 29-32: Estoque › Desperdício: one month at a time, per owner ("Todos" by default).
function useStockWasteViewModel() {
  const { getLocale } = useTranslationLocale();
  const owners = useActiveOwners();
  const current = currentMonthKey();
  const [month, setMonth] = useState(current);
  const [ownerId, setOwnerId] = useState(WASTE_OWNER_ALL);
  const [showAll, setShowAll] = useState(false);
  const [tab, setTab] = useState<StockWasteTab>("reason");
  const owner = ownerId === WASTE_OWNER_ALL ? undefined : ownerId;

  const waste = useQuery<WasteEntity>({
    cacheKey: [
      useCases.getWasteUseCase.uniqueName,
      month,
      owner ?? "",
      showAll ? "all" : "top",
    ],
    fetch: async () =>
      useCases.getWasteUseCase.execute({ all: showAll, month, ownerId: owner }),
  });
  const languageTag = getLocale().languageTag;
  const model = useMemo(
    () =>
      waste.data
        ? new WasteUIModel(waste.data, languageTag, current)
        : undefined,
    [waste.data, languageTag, current],
  );

  return {
    errorKey:
      waste.error && !waste.data ? ("stock.waste.error" as const) : undefined,
    isLoading: waste.isFetching && !waste.data,
    model,
    onMonthNext: () => setMonth((value) => shiftMonth(value, 1)),
    onMonthPrevious: () => setMonth((value) => shiftMonth(value, -1)),
    onOwnerChange: (value: string) => {
      setOwnerId(value);
      setShowAll(false);
    },
    onRetry: async () => waste.refetch(),
    onShowAll: () => setShowAll(true),
    onTabChange: (value: string) => setTab(value as StockWasteTab),
    ownerId,
    ownerOptions: (owners.data ?? []).map((item) => ({
      id: item.id,
      isUser: item.type === OwnerType.USER,
      name: item.name,
    })),
    tab,
  };
}
