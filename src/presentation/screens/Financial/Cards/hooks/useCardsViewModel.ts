import { useIsFocused } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";

import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import useReadOnlyScope from "@screens/Financial/hooks/useReadOnlyScope";
import {
  ALL_OWNERS,
  archivedOwnerIds,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";
import { listQueryKey } from "@screens/Financial/models/queryKeys";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  aggregateOf,
  buildCardEntries,
  filterCardsByOwner,
  filterSummariesByOwner,
  InvoiceTab,
  resolveSelectedId,
  usedProgress,
} from "../models/cardList";

interface CardsData {
  cards: CreditCardDTO[];
  overview: CreditCardOverviewDTO;
  owners: OwnerDTO[];
}

async function fetchCards(): Promise<CardsData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const ownerIds = owners.map((owner) => owner.id);
  const [overview, cards] = await Promise.all([
    useCases.getFinancialCreditCardsOverviewUseCase.execute(ownerIds),
    useCases.getFinancialCreditCardsUseCase.execute(ownerIds),
  ]);

  return { cards, overview, owners };
}

function useCardsViewModel() {
  const isFocused = useIsFocused();
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);
  const [selectedId, setSelectedId] = useState<string>();
  const [invoiceTab, setInvoiceTab] = useState<InvoiceTab>("open");
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const query = useQuery<CardsData>({
    cacheKey: listQueryKey(
      useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
    ),
    fetch: fetchCards,
  });

  useEffect(() => {
    if (isFocused) {
      query.refetch();
    }
  }, [isFocused]);

  const archivedIds = useMemo(
    () => archivedOwnerIds(query.data?.owners ?? []),
    [query.data],
  );
  const scope = useReadOnlyScope(query.data?.owners, ownerFilter);
  const { openModal } = useModalNavigation();
  const summaries = useMemo(
    () =>
      filterSummariesByOwner(
        query.data?.overview.cards ?? [],
        ownerFilter,
        archivedIds,
      ),
    [query.data, ownerFilter, archivedIds],
  );
  const archived = useMemo(
    () =>
      filterCardsByOwner(
        (query.data?.cards ?? []).filter((card) => card.status === "ARCHIVED"),
        ownerFilter,
        archivedIds,
      ),
    [query.data, ownerFilter, archivedIds],
  );
  const aggregate = useMemo(() => aggregateOf(summaries), [summaries]);
  const resolvedId = resolveSelectedId(summaries, selectedId);
  const selected = summaries.find((item) => item.card.id === resolvedId);
  const entries = useMemo(
    () =>
      buildCardEntries({ archived, archivedExpanded, invoiceTab, selected }),
    [archived, archivedExpanded, invoiceTab, selected],
  );

  function ownerName(ownerId: string) {
    return query.data?.owners.find((owner) => owner.id === ownerId)?.name ?? "";
  }

  return {
    aggregate,
    entries,
    errorMessage: query.error?.message,
    hasCards: summaries.length > 0 || archived.length > 0,
    invoiceTab,
    isLoading: query.isFetching && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddPress: scope.guard(() => openModal("add_new_credit_card")),
    onArchivedCardPress: scope.guard((id: string) =>
      openModal("add_new_credit_card", { id }),
    ),
    onArchivedToggle: () => setArchivedExpanded((expanded) => !expanded),
    onCardSelect: (id: string) => setSelectedId(id),
    onEarlyPaymentPress: () => {
      if (resolvedId) {
        openModal("card_early_payment", { creditCardId: resolvedId });
      }
    },
    onEditPress: () => {
      if (resolvedId) {
        openModal("add_new_credit_card", { id: resolvedId });
      }
    },
    onInvoicePress: scope.guard((cardId: string, month: string) =>
      openModal("invoice_detail", { cardId, month }),
    ),
    onInvoiceTabChange: (value: string) =>
      setInvoiceTab(
        value === "closed" || value === "upcoming" ? value : "open",
      ),
    onOwnerFilterChange: setOwnerFilter,
    onRefresh: async () => query.refetch(),
    onRefundPress: () => {
      if (resolvedId) {
        openModal("card_refund", { creditCardId: resolvedId });
      }
    },
    onRetry: async () => query.refetch(),
    onToastHide: scope.onToastHide,
    ownerChoices: buildOwnerFilterChoices(query.data?.owners ?? []),
    ownerFilter,
    ownerName,
    readOnly: scope.readOnly,
    selected,
    selectedId: resolvedId,
    summaries,
    toastVisible: scope.toastVisible,
    usedProgress: usedProgress(aggregate),
  };
}

export { fetchCards };
export default useCardsViewModel;
