import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import {
  ALL_OWNERS,
  buildOwnerFilterChoices,
} from "@screens/Financial/models/ownerOptions";

import {
  buildAccountEntries,
  filterByOwner,
  totalActiveCents,
  totalAmount,
} from "../models/accountList";
import AccountUIModel from "../models/AccountUIModel";

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

async function fetchAccounts(): Promise<AccountsData> {
  const owners = await useCases.getOwnersUseCase.execute();
  const accounts = await useCases.getFinancialAccountsUseCase.execute(
    owners.map((owner) => owner.id),
  );

  return { accounts, owners };
}

function useAccountsViewModel() {
  const isFocused = useIsFocused();
  const [ownerFilter, setOwnerFilter] = useState(ALL_OWNERS);
  const [archivedExpanded, setArchivedExpanded] = useState(false);

  const query = useQuery<AccountsData>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    fetch: fetchAccounts,
  });

  useEffect(() => {
    if (isFocused) {
      query.refetch();
    }
  }, [isFocused]);

  const filtered = useMemo(() => {
    const owners = query.data?.owners ?? [];
    const models = (query.data?.accounts ?? []).map(
      (dto) => new AccountUIModel(dto, owners),
    );

    return filterByOwner(models, ownerFilter);
  }, [query.data, ownerFilter]);

  const entries = useMemo(
    () => buildAccountEntries(filtered, archivedExpanded),
    [filtered, archivedExpanded],
  );

  return {
    archivedCount: filtered.filter((account) => account.isArchived).length,
    entries,
    errorMessage: query.error?.message,
    isEmpty: filtered.length === 0,
    isLoading: query.isFetching && !query.data,
    isRefreshing: query.isFetching && !!query.data,
    onAddPress: () =>
      router.push("/financial/account/add_new_account" as never),
    onArchivedToggle: () => setArchivedExpanded((expanded) => !expanded),
    onOwnerFilterChange: setOwnerFilter,
    onRefresh: async () => query.refetch(),
    onRetry: async () => query.refetch(),
    onRowPress: (id: string) =>
      router.push({
        params: { id },
        pathname: "/financial/account/add_new_account",
      } as never),
    ownerChoices: buildOwnerFilterChoices(query.data?.owners ?? []),
    ownerFilter,
    totalAmount: totalAmount(totalActiveCents(filtered)),
  };
}

export { fetchAccounts };
export default useAccountsViewModel;
