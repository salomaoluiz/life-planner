import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import { useCases } from "@application/useCases";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import {
  assignableInvoices,
  toCalendarDate,
  todayDate,
} from "@screens/Financial/models/creditSheet";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import { leftToPay, PayMethod, validate } from "../models/earlyPaymentState";

type EarlyPaymentParams = {
  creditCardId: string;
  // Edit mode when set; the stored payment is read from `invoiceMonth`'s invoice.
  id?: string;
  invoiceMonth?: string;
};

interface Edits {
  accountId?: string;
  amountCents?: number;
  date?: Date;
  description?: string;
  invoiceMonth?: string;
  method?: PayMethod;
}

// An early payment changes invoices, the limit, an account balance and the month summaries (spec 032).
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

function useEarlyPaymentViewModel() {
  const params = useLocalSearchParams<EarlyPaymentParams>();
  const isEdit = !!params.id;
  const [edits, setEdits] = useState<Edits>({});
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
  const accounts = useQuery<AccountDTO[]>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () => useCases.getFinancialAccountsUseCase.execute(ownerIds),
  });
  const stored = useQuery<CardInvoiceDTO>({
    cacheKey: [
      useCases.getFinancialCardInvoiceUseCase.uniqueName,
      params.creditCardId,
      params.invoiceMonth ?? "",
    ],
    enabled: isEdit && !!params.invoiceMonth,
    fetch: async () =>
      useCases.getFinancialCardInvoiceUseCase.execute({
        creditCardId: params.creditCardId,
        month: params.invoiceMonth as string,
      }),
  });
  const createMutation = useMutation({
    cacheKey: [useCases.createFinancialEarlyPaymentUseCase.uniqueName],
    fetch: useCases.createFinancialEarlyPaymentUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateFinancialEarlyPaymentUseCase.uniqueName],
    fetch: useCases.updateFinancialEarlyPaymentUseCase.execute,
  });
  const deleteMutation = useMutation({
    cacheKey: [useCases.deleteFinancialEarlyPaymentUseCase.uniqueName],
    fetch: useCases.deleteFinancialEarlyPaymentUseCase.execute,
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
  const credit = stored.data?.credits.find((item) => item.id === params.id);
  const original = credit
    ? {
        accountId: credit.accountId,
        amountCents: credit.value,
        date: parseDate(credit.date),
        description: credit.description,
        method: (credit.method ?? "ACCOUNT") as PayMethod,
      }
    : undefined;
  const allInvoices = useMemo(() => assignableInvoices(summary), [summary]);
  // A new payment needs something left to pay; an edited one keeps its own invoice in the list.
  const invoices = allInvoices.filter(
    (invoice) =>
      invoice.amountDueCents > 0 ||
      (isEdit && invoice.month === params.invoiceMonth),
  );
  const invoiceMonth =
    edits.invoiceMonth ?? params.invoiceMonth ?? invoices[0]?.month;
  const target = invoices.find((invoice) => invoice.month === invoiceMonth);
  const isSameInvoice = isEdit && invoiceMonth === params.invoiceMonth;
  const leftCents = leftToPay(
    target,
    original?.amountCents ?? 0,
    isSameInvoice,
  );
  const method = edits.method ?? original?.method ?? "ACCOUNT";
  const accountId = edits.accountId ?? original?.accountId;
  const amountCents =
    edits.amountCents ?? original?.amountCents ?? (isEdit ? 0 : leftCents);
  const date = edits.date ?? original?.date ?? todayDate();
  const description = edits.description ?? original?.description;
  // A payment of a paid invoice only changes its description (spec 032 FR 34).
  const isLocked =
    isEdit &&
    !!summary &&
    !allInvoices.some((invoice) => invoice.month === params.invoiceMonth);
  const activeAccounts = (accounts.data ?? []).filter(
    (account) => account.status === "ACTIVE" || account.id === accountId,
  );

  function errorsOf(finalDescription: string) {
    return validate(
      { accountId, amountCents, date, method },
      finalDescription,
      leftCents,
      todayDate(),
    );
  }

  function patch(next: Edits) {
    setEdits((current) => ({ ...current, ...next }));
  }

  function onSave(defaultDescription: string) {
    const finalDescription = (description ?? defaultDescription).trim();
    const errors = errorsOf(finalDescription);

    setSubmitted(true);

    if (isLocked) {
      if (!errors.description) {
        updateMutation.mutate({
          creditCardId: params.creditCardId,
          description: finalDescription,
          id: params.id as string,
        });
      }

      return;
    }

    if (Object.keys(errors).length > 0 || !invoiceMonth) {
      return;
    }

    const fields = {
      accountId: method === "ACCOUNT" ? accountId : undefined,
      creditCardId: params.creditCardId,
      date: toCalendarDate(date),
      description: finalDescription,
      invoiceMonth,
      method,
      value: amountCents,
    };

    if (isEdit) {
      updateMutation.mutate({ ...fields, id: params.id as string });
    } else {
      createMutation.mutate(fields);
    }
  }

  return {
    accountId,
    accountOptions: activeAccounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    amountCents,
    card: summary?.card,
    currency: summary?.card.currency ?? DEFAULT_CURRENCY,
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
    isLoading: !summary || (isEdit && !!params.invoiceMonth && !credit),
    isLocked,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    leftCents,
    method,
    onAccountChange: (value: string) => patch({ accountId: value }),
    onAmountChange: (value: number) => patch({ amountCents: value }),
    onClose: () => router.back(),
    onDateChange: (value?: Date) => value && patch({ date: value }),
    onDeleteCancel: () => setDeleteOpen(false),
    onDeleteConfirm: () => {
      setDeleteOpen(false);
      deleteMutation.mutate({
        creditCardId: params.creditCardId,
        id: params.id as string,
      });
    },
    onDeletePress: () => setDeleteOpen(true),
    onDescriptionChange: (value: string) => patch({ description: value }),
    onInvoiceChange: (value: string) =>
      // The prefilled value follows the invoice until the user types one.
      patch({ amountCents: undefined, invoiceMonth: value }),
    onMethodChange: (value: string) =>
      patch({ method: value === "EXTERNAL" ? "EXTERNAL" : "ACCOUNT" }),
    onSave,
    remainingCents: Math.max(0, leftCents - amountCents),
  };
}

export type { EarlyPaymentParams };
export default useEarlyPaymentViewModel;
