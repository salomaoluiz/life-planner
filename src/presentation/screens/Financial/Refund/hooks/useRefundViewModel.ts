import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import {
  assignableInvoices,
  defaultInvoiceMonth,
  toCalendarDate,
  todayDate,
} from "@screens/Financial/models/creditSheet";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  createLinkFields,
  linkedFromParams,
  linkedOptions,
  refundCarry,
  updateLinkFields,
  validate,
} from "../models/refundState";

type RefundParams = {
  creditCardId: string;
  // Edit mode when set; the fields below then describe the stored refund.
  date?: string;
  description?: string;
  id?: string;
  invoiceMonth?: string;
  refundedPlanId?: string;
  refundedTransactionId?: string;
  // Cents, as text.
  value?: string;
};

// A refund changes invoices, the limit and the month summaries (spec 032).
function invalidateAfterWrite() {
  [
    useCases.getFinancialTransactionsUseCase.uniqueName,
    useCases.getFinancialCardInvoiceUseCase.uniqueName,
    useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
    useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
    useCases.getFinancialAccountsUseCase.uniqueName,
    useCases.getMonthSummaryUseCase.uniqueName,
  ].forEach(async (key) => invalidateFetcherData([key]));
}

function parseDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

function useRefundViewModel() {
  const params = useLocalSearchParams<RefundParams>();
  const isEdit = !!params.id;
  const originalCents = params.value ? Number(params.value) : 0;
  const [amountCents, setAmountCents] = useState(originalCents);
  const [date, setDate] = useState(() =>
    params.date ? parseDate(params.date) : todayDate(),
  );
  const [description, setDescription] = useState(params.description);
  const [invoiceChoice, setInvoiceChoice] = useState(params.invoiceMonth);
  // The link comes only from the purchase or plan the sheet was opened from, and never changes (spec 032 FR 22).
  const linked = linkedFromParams(params);
  const [submitted, setSubmitted] = useState(false);
  const [isDeleteOpen, setDeleteOpen] = useState(false);

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const ownerIds = (owners.data ?? []).map((owner) => owner.id);
  const overview = useQuery<CreditCardOverviewDTO>({
    cacheKey: [useCases.getFinancialCreditCardsOverviewUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsOverviewUseCase.execute(ownerIds),
  });
  const transactions = useQuery<TransactionDTO[]>({
    cacheKey: [useCases.getFinancialTransactionsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialTransactionsUseCase.execute({ ownerIds }),
  });
  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialRefundUseCase.uniqueName],
    fetch: useCases.createFinancialRefundUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialRefundUseCase.uniqueName],
    fetch: useCases.updateFinancialRefundUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialRefundUseCase.uniqueName],
    fetch: useCases.deleteFinancialRefundUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success" ||
      deleteMutation.status === "success"
    ) {
      invalidateAfterWrite();
      router.back();
    }
  }, [createMutation.status, updateMutation.status, deleteMutation.status]);

  const summary = overview.data?.cards.find(
    (item) => item.card.id === params.creditCardId,
  );
  const invoices = useMemo(() => assignableInvoices(summary), [summary]);
  const invoiceMonth =
    invoiceChoice ??
    (summary
      ? defaultInvoiceMonth(
          toCalendarDate(date),
          summary.card.closingDay,
          invoices,
        )
      : undefined);
  const target = invoices.find((invoice) => invoice.month === invoiceMonth);
  const options = useMemo(
    () => linkedOptions(transactions.data ?? [], params.creditCardId),
    [transactions.data, params.creditCardId],
  );
  // A refund of a paid invoice only changes its description (spec 032 FR 25).
  const isLocked =
    isEdit &&
    !!summary &&
    !invoices.some((invoice) => invoice.month === params.invoiceMonth);
  function errorsOf(finalDescription: string) {
    return validate(
      { amountCents, date, invoiceMonth, linked },
      finalDescription,
    );
  }
  const carryCents =
    target && amountCents > 0
      ? refundCarry(
          target.totalCents,
          amountCents,
          invoiceMonth === params.invoiceMonth ? originalCents : 0,
        )
      : 0;

  function onSave(defaultDescription: string) {
    const finalDescription = (description ?? defaultDescription).trim();
    const errors = errorsOf(finalDescription);

    setSubmitted(true);

    if (Object.keys(errors).length > 0 && !(isLocked && !errors.description)) {
      return;
    }

    if (isEdit && isLocked) {
      updateMutation.mutate({
        creditCardId: params.creditCardId,
        description: finalDescription,
        id: params.id as string,
      });

      return;
    }

    const fields = {
      creditCardId: params.creditCardId,
      date: toCalendarDate(date),
      description: finalDescription,
      invoiceMonth: invoiceMonth as string,
      value: amountCents,
    };

    if (isEdit) {
      updateMutation.mutate({
        ...fields,
        ...updateLinkFields(linked),
        id: params.id as string,
      });
    } else {
      createMutation.mutate({ ...fields, ...createLinkFields(linked) });
    }
  }

  return {
    amountCents,
    card: summary?.card,
    carryCents,
    carryMonth: invoiceMonth ? addMonthsTo(invoiceMonth, 1) : undefined,
    date,
    description,
    errors: submitted ? errorsOf((description ?? "x").trim()) : {},
    formErrorKey: getFinancialErrorMessageKey(
      createMutation.error ?? updateMutation.error ?? deleteMutation.error,
    ),
    invoiceMonth,
    invoices,
    isDeleteOpen,
    isDeleting: deleteMutation.isFetching,
    isEdit,
    isLoading: !summary,
    isLocked,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    linked,
    linkedIsPlan: !!linked?.startsWith("plan:"),
    linkedName: options.find((option) => option.value === linked)?.name,
    onAmountChange: setAmountCents,
    onClose: () => router.back(),
    onDateChange: (value?: Date) => value && setDate(value),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => {
      setDeleteOpen(false);
      deleteMutation.mutate({
        creditCardId: params.creditCardId,
        id: params.id as string,
      });
    },
    onDeletePress: () => setDeleteOpen(true),
    onDescriptionChange: setDescription,
    onInvoiceChange: setInvoiceChoice,
    onSave,
  };
}

export type { RefundParams };
export default useRefundViewModel;
