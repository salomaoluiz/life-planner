import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { incomeWithholdingBps } from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { estimateOf } from "@screens/Investment/Modals/IncomeModal/models/incomeFormState";
import { formatDay, formatMoney } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type IncomeReceiveModalVM = ReturnType<
  typeof useIncomeReceiveModalViewModel
>;

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

export default useIncomeReceiveModalViewModel;

// Spec 107 FR 12: confirms a planned income with the amount that really landed (096's "Efetivar" pattern).
function useIncomeReceiveModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ id: string }>();
  const income = useQuery({
    cacheKey: [...investmentKeys.all(), "income", params.id],
    fetch: async () => useCases.getInvestmentIncomeUseCase.execute(params.id),
  });
  const assetId = income.data?.assetId ?? "";
  const asset = useQuery({
    cacheKey: [...investmentKeys.asset(assetId), "form"],
    enabled: !!assetId,
    fetch: async () => useCases.getInvestmentAssetUseCase.execute(assetId),
  });
  const accountsQuery = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw("investment-income-receive"),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });
  const receive = useMutation({
    cacheKey: [useCases.receiveInvestmentIncomeUseCase.uniqueName],
    fetch: useCases.receiveInvestmentIncomeUseCase.execute,
  });
  const remove = useMutation({
    cacheKey: [useCases.deleteInvestmentIncomeUseCase.uniqueName],
    fetch: useCases.deleteInvestmentIncomeUseCase.execute,
  });

  const [net, setNet] = useState<number>();
  const [receivedOn, setReceivedOn] = useState<Date>(new Date());
  const [accountId, setAccountId] = useState<string>();

  useEffect(() => {
    if (receive.status === "success" || remove.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [receive.status, remove.status]);

  const data = income.data;
  const currency = data?.currency ?? "BRL";
  const accounts = useMemo(() => {
    const archivedOwners = new Set(
      (accountsQuery.data?.owners ?? [])
        .filter((owner) => owner.archived)
        .map((owner) => owner.id),
    );

    return (accountsQuery.data?.accounts ?? [])
      .filter(
        (account) =>
          account.status === "ACTIVE" &&
          account.currency === currency &&
          !archivedOwners.has(account.ownerId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accountsQuery.data, currency]);
  const netCents = net ?? data?.netAmount ?? 0;
  const bps =
    data && asset.data
      ? incomeWithholdingBps(data.type, asset.data.assetClass)
      : 0;
  const currentAccountId = accountId ?? data?.accountId ?? "";

  function onSave() {
    if (!data || netCents <= 0) {
      return;
    }

    receive.mutate({
      accountId: currentAccountId || undefined,
      id: data.id,
      netAmount: netCents,
      receivedOn: todayCalendarDate(receivedOn),
    });
  }

  return {
    accountId: currentAccountId,
    accountOptions: accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    assetLabel: asset.data ? (asset.data.ticker ?? asset.data.name) : "",
    currency,
    failure: getInvestmentErrorMessage(receive.error ?? remove.error, (day) =>
      formatDay(day, localeTag),
    ),
    gross: formatMoney(estimateOf(netCents, bps).gross, currency, localeTag),
    grossRate: `${bps / 100}%`,
    isLoading: income.isFetching && !data,
    isNotFound: !!income.error && !data,
    isSaving: receive.isFetching || remove.isFetching,
    net: netCents,
    onAccountChange: setAccountId,
    onClose: closeModal,
    onDelete: () => data && remove.mutate(data.id),
    onNetChange: setNet,
    onReceivedOnChange: (value?: Date) => value && setReceivedOn(value),
    onSave,
    planned: data ? formatMoney(data.netAmount, currency, localeTag) : "",
    plannedFor: data ? formatDay(data.paymentDate, localeTag) : "",
    receivedOn,
    showGross: bps > 0,
    typeKey: data
      ? (`investment.income.types.${data.type}` as const)
      : undefined,
  };
}
