import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { useCases } from "@application/useCases";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { TranslationKeys } from "@presentation/i18n/types";
import { categoryInScope } from "@screens/Financial/models/categoryTree";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  changeScope,
  editableFields,
  EditScope,
  initialState,
  InstallmentEditState,
  needsRecalcConfirm,
  toPlanUpdate,
  toTransactionUpdate,
  validate,
} from "../models/installmentEditState";

const REFUND_ROUTE = "/financial/refund/card_refund";
const PREPAY_ROUTE = "/financial/prepayment/prepay_installments";

// Plan writes move card purchases, invoices, the limit and the month lists (spec 030).
function invalidateAfterWrite() {
  [
    useCases.getFinancialTransactionsUseCase.uniqueName,
    useCases.getFinancialCardInvoiceUseCase.uniqueName,
    useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
    useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
    useCases.getFinancialInstallmentPlanUseCase.uniqueName,
    useCases.getFinancialAccountsUseCase.uniqueName,
    useCases.getMonthSummaryUseCase.uniqueName,
  ].forEach(async (key) => invalidateFetcherData([key]));
}

function useInstallmentEditViewModel() {
  const params = useLocalSearchParams<{ id?: string }>();

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const ownerIds = (owners.data ?? []).map((owner) => owner.id);
  const transactions = useQuery({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionsUseCase.execute({ ownerIds }),
  });
  const transaction = transactions.data?.find((item) => item.id === params.id);
  const planId = transaction?.installmentPlanId;
  const plan = useQuery({
    cacheKey: [
      useCases.getFinancialInstallmentPlanUseCase.uniqueName,
      planId ?? "",
    ],
    enabled: !!planId,
    fetch: async () =>
      useCases.getFinancialInstallmentPlanUseCase.execute(planId!),
  });
  const cards = useQuery({
    cacheKey: [useCases.getFinancialCreditCardsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(ownerIds),
  });
  const categories = useQuery({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () => useCases.getFinancialCategoriesUseCase.execute(ownerIds),
  });

  const initial = useMemo(
    () =>
      plan.data && transaction
        ? initialState(plan.data, transaction)
        : undefined,
    [plan.data, transaction],
  );
  const [edited, setEdited] = useState<InstallmentEditState>();
  const [submitted, setSubmitted] = useState(false);
  const [isPlanOpen, setPlanOpen] = useState(false);
  const [isRecalcOpen, setRecalcOpen] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);
  const [isUndoPrepaymentOpen, setUndoPrepaymentOpen] = useState(false);
  const state = edited ?? initial;

  const updateTransactionMutation = useMutation({
    cacheKey: [useCases.updateFinancialTransactionUseCase.uniqueName],
    fetch: useCases.updateFinancialTransactionUseCase.execute,
  });
  const updatePlanMutation = useMutation({
    cacheKey: [useCases.updateFinancialInstallmentPlanUseCase.uniqueName],
    fetch: useCases.updateFinancialInstallmentPlanUseCase.execute,
  });
  const deletePlanMutation = useMutation({
    cacheKey: [useCases.deleteFinancialInstallmentPlanUseCase.uniqueName],
    fetch: useCases.deleteFinancialInstallmentPlanUseCase.execute,
  });

  const undoPrepaymentMutation = useMutation({
    cacheKey: [useCases.undoFinancialPrepaymentUseCase.uniqueName],
    fetch: useCases.undoFinancialPrepaymentUseCase.execute,
  });

  useEffect(() => {
    if (undoPrepaymentMutation.status === "success") {
      invalidateAfterWrite();
      setUndoPrepaymentOpen(false);
      plan.refetch();
    }
  }, [undoPrepaymentMutation.status]);

  useEffect(() => {
    if (
      updateTransactionMutation.status === "success" ||
      updatePlanMutation.status === "success" ||
      deletePlanMutation.status === "success"
    ) {
      invalidateAfterWrite();
      router.back();
    }
  }, [
    updateTransactionMutation.status,
    updatePlanMutation.status,
    deletePlanMutation.status,
  ]);

  const row = plan.data?.installments.find((item) => item.id === params.id);
  const isPaid = row?.invoiceStatus === "PAID";
  const fields = editableFields(state?.scope ?? "ONLY_THIS", isPaid);
  const errors = submitted && state ? validate(state, fields) : {};
  const isSaving =
    updateTransactionMutation.isFetching || updatePlanMutation.isFetching;
  const formErrorKey = getFinancialErrorMessageKey(
    updateTransactionMutation.error ??
      updatePlanMutation.error ??
      deletePlanMutation.error ??
      undoPrepaymentMutation.error,
  );
  const ownerId = plan.data?.ownerId;

  function update(next: InstallmentEditState) {
    setEdited(next);
  }

  function save() {
    if (!state || !plan.data || !transaction) {
      return;
    }

    if (state.scope === "ALL") {
      updatePlanMutation.mutate(toPlanUpdate(plan.data, state, isPaid));
    } else {
      updateTransactionMutation.mutate(
        toTransactionUpdate(transaction, state, isPaid),
      );
    }
  }

  function onSave() {
    setSubmitted(true);
    if (!state || !plan.data || Object.keys(validate(state, fields)).length) {
      return;
    }
    if (!isPaid && needsRecalcConfirm(plan.data, state)) {
      setRecalcOpen(true);
      return;
    }
    save();
  }

  return {
    cardOptions: (cards.data ?? [])
      .filter(
        (card) =>
          card.ownerId === ownerId &&
          (card.status === "ACTIVE" || card.id === state?.creditCardId),
      )
      .map((card) => ({
        label: card.lastDigits
          ? `${card.title} ••${card.lastDigits}`
          : card.title,
        value: card.id,
      })),
    categoryOptions: (categories.data ?? [])
      .filter(
        (category) =>
          ownerId !== undefined &&
          categoryInScope(category, ownerId) &&
          category.type === "EXPENSE",
      )
      .map((category) => ({ label: category.name, value: category.id })),
    currency: plan.data?.currency ?? DEFAULT_CURRENCY,
    errors,
    fields,
    formErrorKey: formErrorKey as TranslationKeys | undefined,
    installmentCount: plan.data?.installmentCount ?? 0,
    installmentNumber: transaction?.installmentNumber ?? 0,
    isDeleteOpen,
    isDeleting: deletePlanMutation.isFetching,
    isLoading: !state && !(transactions.data && !transaction),
    isNotFound: !!transactions.data && !transaction,
    isPaid,
    isPlanOpen,
    isRecalcOpen,
    isSaving,
    isUndoingPrepayment: undoPrepaymentMutation.isFetching,
    isUndoPrepaymentOpen,
    onAmountChange: (cents: number) =>
      state && update({ ...state, amountCents: cents }),
    onCardChange: (id: string) =>
      state && update({ ...state, creditCardId: id }),
    onCategoryChange: (id: string) =>
      state && update({ ...state, categoryId: id }),
    onClose: () => router.back(),
    onCountChange: (text: string) =>
      state &&
      update({ ...state, count: Number(text.replace(/\D/g, "")) || 0 }),
    onDateChange: (date: Date) =>
      state &&
      update({
        ...state,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      }),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => {
      setDeleteOpen(false);
      if (planId) {
        deletePlanMutation.mutate(planId);
      }
    },
    onDeletePress: () => setDeleteOpen(true),
    onDescriptionChange: (text: string) =>
      state && update({ ...state, description: text }),
    onPlanClose: () => setPlanOpen(false),
    onPlanOpen: () => setPlanOpen(true),
    onPrepayPress: () => {
      if (planId) {
        router.replace({
          params: { planId },
          pathname: PREPAY_ROUTE,
        } as never);
      }
    },
    onRecalcCancel: () => setRecalcOpen(false),
    onRecalcConfirm: () => {
      setRecalcOpen(false);
      save();
    },
    onRefundPress: () => {
      if (planId && state?.creditCardId) {
        router.replace({
          params: { creditCardId: state.creditCardId, refundedPlanId: planId },
          pathname: REFUND_ROUTE,
        } as never);
      }
    },
    onSave,
    onScopeChange: (value: string) => {
      if (state && plan.data && transaction) {
        update(changeScope(state, value as EditScope, plan.data, transaction));
      }
    },
    onUndoPrepaymentCancel: () => setUndoPrepaymentOpen(false),
    onUndoPrepaymentConfirm: () => {
      if (planId) {
        undoPrepaymentMutation.mutate(planId);
      }
    },
    // The confirmation lives behind the plan sheet: close it first.
    onUndoPrepaymentPress: () => {
      setPlanOpen(false);
      setUndoPrepaymentOpen(true);
    },
    plan: plan.data,
    state,
  };
}

export default useInstallmentEditViewModel;
