import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { TranslationKeys } from "@presentation/i18n/types";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";
import {
  categoryInScope,
  selectableCategories,
} from "@screens/Financial/models/categoryTree";
import {
  addMonthsTo,
  invoiceMonthOf,
} from "@screens/Financial/models/invoiceMonth";
import { buildInvoiceOptions } from "@screens/Financial/models/invoiceOptions";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  calendarDayOf,
  changeScope,
  editableFields,
  EditScope,
  firstInvoiceMonthOf,
  initialState,
  InstallmentEditState,
  needsRecalcConfirm,
  toPlanUpdate,
  toTransactionUpdate,
  validate,
} from "../models/installmentEditState";

export type InstallmentEditVM = ReturnType<typeof useInstallmentEditViewModel>;

// Plan writes move card purchases, invoices, the limit and the month lists (spec 030).
function invalidateAfterWrite() {
  void invalidateFinanceData();
}

export default useInstallmentEditViewModel;

function useInstallmentEditViewModel() {
  const { closeModal, replaceModal } = useModalNavigation();
  const params = useLocalSearchParams<{ id?: string }>();

  const owners = useOwners();
  const ownerIds = (owners.data ?? []).map((owner) => owner.id);
  // The row of the sheet, by id (spec 077); `null` once the API says it is missing or not readable.
  const transactionQuery = useQuery({
    cacheKey: financeKeys.transactions.raw("byId", params.id ?? ""),
    enabled: !!owners.data && !!params.id,
    fetch: async () =>
      useCases.getFinancialTransactionByIdUseCase.execute({
        id: params.id!,
        ownerIds,
      }),
  });
  const transaction = transactionQuery.data ?? undefined;
  const planId = transaction?.installmentPlanId;
  const plan = useQuery({
    cacheKey: financeKeys.installmentPlans.raw(planId ?? ""),
    enabled: !!planId,
    fetch: async () =>
      useCases.getFinancialInstallmentPlanUseCase.execute(planId!),
  });
  const cards = useQuery({
    cacheKey: financeKeys.creditCards.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(ownerIds),
  });
  const categories = useQuery({
    cacheKey: financeKeys.categories.raw(),
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
      closeModal();
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
  const stateCard = (cards.data ?? []).find(
    (card) => card.id === state?.creditCardId,
  );
  // Spec 095 FR 18: the picker of the row (previous, natural and next of its natural month) or, with "All",
  // of the 1st installment. Paid invoices come from the plan rows: no extra request.
  const invoiceOptions =
    state && plan.data && transaction && stateCard && fields.invoice
      ? buildInvoiceOptions({
          card: stateCard,
          date: calendarDayOf(state.date),
          paidMonths: plan.data.installments
            .filter((item) => item.invoiceStatus === "PAID")
            .map((item) => item.invoiceMonth),
          shiftMonths:
            state.scope === "ALL"
              ? 0
              : Math.max(0, (transaction.installmentNumber ?? 1) - 1),
          storedMonth:
            state.scope === "ALL"
              ? firstInvoiceMonthOf(plan.data)
              : transaction.invoiceMonth,
          today: calendarDayOf(new Date()),
        })
      : undefined;
  const invoiceField = invoiceOptions
    ? {
        computedMonth: invoiceOptions.find((option) => option.isComputed)!
          .month,
        options: invoiceOptions,
        value: state!.invoiceMonth,
      }
    : undefined;

  // A new date or card restarts the 1st invoice from the date (spec 095 FR 15).
  function withFirstInvoice(next: InstallmentEditState) {
    const card = (cards.data ?? []).find(
      (item) => item.id === next.creditCardId,
    );

    return next.scope === "ALL" && card
      ? {
          ...next,
          invoiceMonth: addMonthsTo(
            invoiceMonthOf(calendarDayOf(next.date), card.closingDay),
            0,
          ),
        }
      : next;
  }

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
    categoryOptions: selectableCategories(
      categories.data ?? [],
      state?.categoryId,
    )
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
    invoiceField,
    isDeleteOpen,
    isDeleting: deletePlanMutation.isFetching,
    isLoading: !state && transactionQuery.data !== null,
    isNotFound: transactionQuery.data === null,
    isPaid,
    isPlanOpen,
    isRecalcOpen,
    isSaving,
    isUndoingPrepayment: undoPrepaymentMutation.isFetching,
    isUndoPrepaymentOpen,
    onAmountChange: (cents: number) =>
      state && update({ ...state, amountCents: cents }),
    onCardChange: (id: string) =>
      state && update(withFirstInvoice({ ...state, creditCardId: id })),
    onCategoryChange: (id: string) =>
      state && update({ ...state, categoryId: id }),
    onClose: () => closeModal(),
    onCountChange: (text: string) =>
      state &&
      update({ ...state, count: Number(text.replace(/\D/g, "")) || 0 }),
    onDateChange: (date: Date) =>
      state &&
      update(
        withFirstInvoice({
          ...state,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        }),
      ),
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
    onInvoiceChange: (month: string) =>
      state && update({ ...state, invoiceMonth: month }),
    onInvoiceReset: () =>
      state &&
      invoiceField &&
      update({ ...state, invoiceMonth: invoiceField.computedMonth }),
    onNotesChange: (text: string) => state && update({ ...state, notes: text }),
    onPlanClose: () => setPlanOpen(false),
    onPlanOpen: () => setPlanOpen(true),
    onPrepayPress: () => {
      if (planId) {
        replaceModal("prepay_installments", { planId });
      }
    },
    onRecalcCancel: () => setRecalcOpen(false),
    onRecalcConfirm: () => {
      setRecalcOpen(false);
      save();
    },
    onRefundPress: () => {
      if (planId && state?.creditCardId) {
        replaceModal("card_refund", {
          creditCardId: state.creditCardId,
          refundedPlanId: planId,
        });
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
