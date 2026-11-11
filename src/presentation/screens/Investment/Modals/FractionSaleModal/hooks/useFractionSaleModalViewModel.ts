import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { InvestmentFeeKind } from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatResult,
  resultTone,
} from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  FractionFee,
  hasErrors,
  newFee,
  realizedResult,
  toDay,
  toFeeParams,
  validateSale,
} from "../models/fractionSaleForm";

export type FractionSaleModalVM = ReturnType<
  typeof useFractionSaleModalViewModel
>;

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

export default useFractionSaleModalViewModel;

function dayToDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);

  return new Date(year, month - 1, date);
}

// Spec 108 FR 15-19: records the cash of a fraction auction (a new sale of the event's fraction, or an edit of one);
// the position never changes, only the realized result does.
function useFractionSaleModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{
    assetId: string;
    eventId: string;
    id?: string;
  }>();
  const isEdit = !!params.id;
  const asset = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const accountsQuery = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw("investment-fraction-sale"),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });
  const create = useMutation({
    cacheKey: [useCases.createInvestmentFractionSaleUseCase.uniqueName],
    fetch: useCases.createInvestmentFractionSaleUseCase.execute,
  });
  const update = useMutation({
    cacheKey: [useCases.updateInvestmentOperationUseCase.uniqueName],
    fetch: useCases.updateInvestmentOperationUseCase.execute,
  });
  const remove = useMutation({
    cacheKey: [useCases.deleteInvestmentOperationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentOperationUseCase.execute,
  });

  const [gross, setGross] = useState<number>();
  const [saleDate, setSaleDate] = useState<Date>();
  const [accountId, setAccountId] = useState<string>();
  const [writeOff, setWriteOff] = useState<boolean>();
  const [fees, setFees] = useState<FractionFee[]>();

  useEffect(() => {
    if (
      create.status === "success" ||
      update.status === "success" ||
      remove.status === "success"
    ) {
      void invalidateInvestments();
      closeModal();
    }
  }, [create.status, update.status, remove.status]);

  const detail = asset.data;
  const event = detail?.operations.find(
    (operation) => operation.id === params.eventId,
  );
  const sale = params.id
    ? detail?.operations.find((operation) => operation.id === params.id)
    : undefined;
  const fraction = event?.corporateEvent;
  const currency = detail?.currency ?? "BRL";
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

  // The form starts from the sale being edited; what the owner types replaces it.
  const currentGross = gross ?? sale?.gross ?? 0;
  const currentWriteOff =
    writeOff ?? (!!sale && !sale.generateTransaction && sale.gross === 0);
  const currentAccountId =
    accountId ?? sale?.accountId ?? accounts[0]?.id ?? "";
  const currentDate = saleDate ?? (sale ? dayToDate(sale.date) : new Date());
  const currentFees =
    fees ??
    (sale?.fees ?? []).map((fee) => ({
      amountCents: fee.amount,
      key: fee.id,
      kind: fee.kind,
    }));
  const fractionCost = fraction?.fractionCost ?? 0;
  const errors = validateSale({
    accountId: currentAccountId,
    eventDate: event?.date ?? "0000-00-00",
    fees: currentFees,
    gross: currentWriteOff ? 0 : currentGross,
    saleDate: toDay(currentDate),
    today: toDay(new Date()),
    writeOff: currentWriteOff,
  });
  const realized = realizedResult(
    currentWriteOff ? 0 : currentGross,
    currentWriteOff ? [] : currentFees,
    fractionCost,
  );

  function onSave() {
    if (!event || hasErrors(errors)) {
      return;
    }

    const feeParams = currentWriteOff ? [] : toFeeParams(currentFees);
    const generateTransaction = !currentWriteOff;

    if (sale) {
      update.mutate({
        accountId: generateTransaction ? currentAccountId : null,
        date: toDay(currentDate),
        fees: feeParams,
        generateTransaction,
        grossAmount: currentWriteOff ? 0 : currentGross,
        id: sale.id,
      });

      return;
    }

    create.mutate({
      accountId: generateTransaction ? currentAccountId : undefined,
      date: toDay(currentDate),
      eventId: event.id,
      fees: feeParams,
      generateTransaction,
      grossAmount: currentWriteOff ? 0 : currentGross,
    });
  }

  return {
    accountId: currentAccountId,
    accountOptions: accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    assetLabel: detail ? (detail.ticker ?? detail.name) : "",
    currency,
    date: currentDate,
    errors,
    eventDate: event ? formatDay(event.date, localeTag) : "",
    eventTypeKey: event
      ? (`investment.operation.${event.type}` as const)
      : undefined,
    failure: getInvestmentErrorMessage(
      create.error ?? update.error ?? remove.error,
      (day) => formatDay(day, localeTag),
    ),
    feeKinds: [InvestmentFeeKind.BROKERAGE, InvestmentFeeKind.EXCHANGE_FEES],
    fees: currentFees,
    fractionCost: formatMoney(fractionCost, currency, localeTag),
    fractionQuantity: fraction
      ? formatQuantity(fraction.fractionQuantity, localeTag)
      : "",
    gross: currentWriteOff ? 0 : currentGross,
    isEdit,
    isLoading: asset.isFetching && !detail,
    isNotFound: (!!asset.error && !detail) || (!!detail && !event),
    isSaving: create.isFetching || update.isFetching || remove.isFetching,
    onAccountChange: setAccountId,
    onAddFee: () => setFees([...currentFees, newFee()]),
    onClose: closeModal,
    onDateChange: (value?: Date) => value && setSaleDate(value),
    onDelete: () => sale && remove.mutate(sale.id),
    onFeeAmountChange: (key: string, cents?: number) =>
      setFees(
        currentFees.map((fee) =>
          fee.key === key ? { ...fee, amountCents: cents ?? 0 } : fee,
        ),
      ),
    onFeeKindChange: (key: string, kind: string) =>
      setFees(
        currentFees.map((fee) =>
          fee.key === key ? { ...fee, kind: kind as InvestmentFeeKind } : fee,
        ),
      ),
    onFeeRemove: (key: string) =>
      setFees(currentFees.filter((fee) => fee.key !== key)),
    onGrossChange: setGross,
    onSave,
    onWriteOffChange: setWriteOff,
    realized: formatResult(realized, currency, localeTag),
    realizedTone: resultTone(realized),
    writeOff: currentWriteOff,
  };
}
