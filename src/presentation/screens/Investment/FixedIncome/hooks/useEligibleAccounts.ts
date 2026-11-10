import { useMemo } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

function brokerageRank(account: AccountDTO): number {
  return account.type === AccountType.BROKERAGE ? 0 : 1;
}

function byBrokerageThenName(a: AccountDTO, b: AccountDTO): number {
  return brokerageRank(a) - brokerageRank(b) || a.name.localeCompare(b.name);
}

// Spec 105 FR 3: a calculated title is BRL only, so only active BRL accounts of a writable owner can pay or receive;
// brokerage accounts come first (spec 102 FR 36).
function useEligibleAccounts(scope: string) {
  const query = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw(`investment-fixed-income-${scope}`),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });
  const eligible = useMemo(() => {
    if (!query.data) {
      return [];
    }

    const archivedOwners = new Set(
      query.data.owners
        .filter((owner) => owner.archived)
        .map((owner) => owner.id),
    );

    return query.data.accounts
      .filter(
        (account) =>
          account.status === "ACTIVE" &&
          account.currency === "BRL" &&
          !archivedOwners.has(account.ownerId),
      )
      .sort(byBrokerageThenName);
  }, [query.data]);

  return {
    accounts: eligible,
    isLoaded: !!query.data,
    options: eligible.map((account) => ({
      label: `${account.name} · ${account.currency}`,
      value: account.id,
    })),
  };
}

export default useEligibleAccounts;
