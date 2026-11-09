import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import {
  InvestmentFeeKind,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import { previewOperation } from "@domain/entities/investment/position";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { parseDecimal, ZERO } from "@utils/decimal";

import {
  addFee,
  createInitialState,
  FeeRow,
  hasErrors,
  isSameState,
  OperationFormState,
  removeFee,
  stateFromOperation,
  toCreateParams,
  toUpdateParams,
  updateFee,
  validate,
} from "../models/operationFormState";

export type OperationModalVM = ReturnType<typeof useOperationModalViewModel>;

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

export default useOperationModalViewModel;

function brokerageRank(account: AccountDTO): number {
  return account.type === AccountType.BROKERAGE ? 0 : 1;
}

function byBrokerageThenName(a: AccountDTO, b: AccountDTO): number {
  return brokerageRank(a) - brokerageRank(b) || a.name.localeCompare(b.name);
}

function readOnlyKeyOf(
  accountUnreachable: boolean,
  archived: boolean,
): TranslationKeys | undefined {
  if (accountUnreachable) {
    return "investment.form.operation.readOnlyAccount";
  }

  return archived ? "investment.errors.archived" : undefined;
}

function useOperationModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string; id?: string }>();
  const isEditing = !!params.id;

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const accountsQuery = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw("investment-operation"),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });

  const asset = detail.data;
  const operation = asset?.operations.find((item) => item.id === params.id);
  const isNotFound =
    (!!detail.error && !asset) || (isEditing && !!asset && !operation);

  // Accounts that can pay: active, in the asset currency and of a writable owner; BROKERAGE first (spec 102 FR 36).
  const eligible = useMemo(() => {
    if (!asset || !accountsQuery.data) {
      return [];
    }

    const archivedOwners = new Set(
      accountsQuery.data.owners
        .filter((owner) => owner.archived)
        .map((owner) => owner.id),
    );

    return accountsQuery.data.accounts
      .filter(
        (account) =>
          account.status === "ACTIVE" &&
          account.currency === asset.currency &&
          !archivedOwners.has(account.ownerId),
      )
      .sort(byBrokerageThenName);
  }, [asset, accountsQuery.data]);

  const initial = useMemo(() => {
    if (!asset || !accountsQuery.data) {
      return undefined;
    }
    if (isEditing) {
      return operation ? stateFromOperation(operation) : undefined;
    }

    return createInitialState(eligible[0]?.id);
  }, [asset, accountsQuery.data, isEditing, operation, eligible]);

  const [edited, setEdited] = useState<OperationFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const state = edited ?? initial;
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  const createMutation = useMutation({
    cacheKey: [useCases.createInvestmentOperationUseCase.uniqueName],
    fetch: useCases.createInvestmentOperationUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateInvestmentOperationUseCase.uniqueName],
    fetch: useCases.updateInvestmentOperationUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteInvestmentOperationUseCase.uniqueName],
    fetch: useCases.deleteInvestmentOperationUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      void invalidateInvestments();
      closeModal();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  const preview = useMemo(() => {
    if (!asset || !state) {
      return undefined;
    }

    const quantity = parseDecimal(state.quantity);
    const price = parseDecimal(state.unitPrice);

    if (
      quantity === null ||
      quantity <= ZERO ||
      price === null ||
      price <= ZERO
    ) {
      return undefined;
    }

    return previewOperation(
      asset.operations.filter((item) => item.id !== params.id),
      {
        date: todayCalendarDate(state.date),
        fees: state.fees.map((fee) => fee.amountCents),
        quantity: state.quantity,
        type: state.type,
        unitPrice: state.unitPrice,
      },
    );
  }, [asset, state, params.id]);

  // An operation that points to an account the user cannot reach is read-only (spec 102 section 4).
  const accountUnreachable =
    isEditing &&
    !!operation?.generateTransaction &&
    !!operation.accountId &&
    !!accountsQuery.data &&
    !accountsQuery.data.accounts.some(
      (account) => account.id === operation.accountId,
    );
  const archived = asset?.status === "ARCHIVED";
  const readOnly = accountUnreachable || archived;

  const errors = submitted && state ? validate(state) : undefined;
  const failure = getInvestmentErrorMessage(
    createMutation.error ?? updateMutation.error ?? deleteMutation.error,
    (day) => formatDay(day, localeTag),
  );
  const insufficient =
    state?.type === InvestmentOperationType.SELL && !!preview?.insufficient;

  function update(next: OperationFormState) {
    setEdited(next);
  }

  function onSave() {
    setSubmitted(true);

    if (!state || !asset || readOnly || insufficient) {
      return;
    }
    if (hasErrors(validate(state))) {
      return;
    }

    if (isEditing) {
      updateMutation.mutate(toUpdateParams(params.id!, state));
      return;
    }

    createMutation.mutate(toCreateParams(asset.id, state));
  }

  function onClose() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    closeModal();
  }

  return {
    accountError: errors?.account,
    accountId: state?.accountId,
    accountOptions: eligible.map((account) => ({
      label: `${account.name} · ${account.currency}`,
      value: account.id,
    })),
    asset,
    availableQuantity: preview?.availableQuantity,
    currency: asset?.currency ?? "BRL",
    date: state?.date ?? new Date(),
    deleteOpen,
    discardOpen,
    failure,
    feeErrors: errors?.feeDescriptions ?? {},
    feeKinds: Object.values(InvestmentFeeKind),
    fees: state?.fees ?? ([] as FeeRow[]),
    generate: state?.generate ?? true,
    insufficient,
    isDeleting: deleteMutation.isFetching,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    onAccountChange: (value: string) =>
      state && update({ ...state, accountId: value }),
    onAddFee: () => state && update(addFee(state)),
    onClose,
    onDateChange: (value?: Date) =>
      state && value && update({ ...state, date: value }),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => {
      setDeleteOpen(false);
      deleteMutation.mutate(params.id!);
    },
    onDeleteOpen: () => setDeleteOpen(true),
    onDiscardCancel: () => setDiscardOpen(false),
    onDiscardConfirm: () => closeModal(),
    onFeeAmountChange: (key: string, cents: number) =>
      state && update(updateFee(state, key, { amountCents: cents })),
    onFeeDescriptionChange: (key: string, description: string) =>
      state && update(updateFee(state, key, { description })),
    onFeeKindChange: (key: string, kind: string) =>
      state &&
      update(updateFee(state, key, { kind: kind as InvestmentFeeKind })),
    onFeeRemove: (key: string) => state && update(removeFee(state, key)),
    onGenerateChange: (value: boolean) =>
      state && update({ ...state, generate: value }),
    onQuantityChange: (value: string) =>
      state && update({ ...state, quantity: value }),
    onSave,
    onTypeChange: (value: string) =>
      state && update({ ...state, type: value as InvestmentOperationType }),
    onUnitPriceChange: (value: string) =>
      state && update({ ...state, unitPrice: value }),
    preview,
    quantity: state?.quantity ?? "",
    quantityError: errors?.quantity,
    readOnly,
    readOnlyKey: readOnlyKeyOf(accountUnreachable, archived),
    saveLabelKey: (state?.type === InvestmentOperationType.SELL
      ? "investment.form.operation.saveSell"
      : "investment.form.operation.saveBuy") as TranslationKeys,
    titleKey: (isEditing
      ? "investment.form.operation.editTitle"
      : "investment.form.operation.newTitle") as TranslationKeys,
    type: state?.type ?? InvestmentOperationType.BUY,
    unitPrice: state?.unitPrice ?? "",
    unitPriceError: errors?.unitPrice,
  };
}
