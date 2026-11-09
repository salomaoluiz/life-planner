import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { InvoiceHasProjected } from "@domain/entities/errors";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";
import { toCalendarDate } from "@screens/Financial/models/creditSheet";
import { addMonthsTo } from "@screens/Financial/models/invoiceMonth";
import CardInvoiceUIModel, {
  InvoiceCreditUIModel,
  InvoicePurchaseUIModel,
} from "@screens/Financial/Transactions/models/CardInvoiceUIModel";
import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type InvoiceVM = ReturnType<typeof useInvoiceViewModel>;

type PayMethod = "ACCOUNT" | "EXTERNAL";

// Everything the invoice, the balances and the lists show changes with a payment (spec 029 FR 19-21).
function invalidateAfterPayment() {
  void invalidateFinanceData();
}

// The later of two `YYYY-MM` keys.
function maxMonth(a: string, b: string) {
  return a > b ? a : b;
}

function todayDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

// `YYYY-MM` of the local month.
function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export default useInvoiceViewModel;

function useInvoiceViewModel() {
  const { closeModal, replaceModal } = useModalNavigation();
  const params = useLocalSearchParams<{ cardId: string; month: string }>();
  const [isPayOpen, setPayOpen] = useState(false);
  const [isUndoOpen, setUndoOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>("ACCOUNT");
  const [accountId, setAccountId] = useState<string>();
  const [paidOn, setPaidOn] = useState(todayDate);

  // The early payment and refund forms cache the raw DTO under `[uniqueName, ...]`: this screen caches the UI
  // model, so it gets its own key (sharing one crashed both screens: LIFE-PLANNER-5Z and -61).
  const invoice = useQuery<CardInvoiceUIModel>({
    cacheKey: [...financeKeys.invoice.list(), params.cardId, params.month],
    fetch: async () =>
      new CardInvoiceUIModel(
        await useCases.getFinancialCardInvoiceUseCase.execute({
          creditCardId: params.cardId,
          month: params.month,
        }),
      ),
  });
  // Purchases of series that would land on this invoice (spec 034 FR 14): only months after the current one have any.
  const projectionsFrom = maxMonth(
    addMonthsTo(params.month, -1),
    addMonthsTo(toMonthKey(new Date()), 1),
  );
  const projected = useQuery<TransactionUIModel[]>({
    cacheKey: financeKeys.projections.raw(
      "invoice",
      params.cardId,
      params.month,
    ),
    enabled: !!invoice.data && projectionsFrom <= params.month,
    fetch: async () => {
      const owner = invoice.data!.ownerId;
      const [items, categories] = await Promise.all([
        useCases.getFinancialProjectionsUseCase.execute({
          from: projectionsFrom,
          ownerIds: [owner],
          to: params.month,
        }),
        useCases.getFinancialCategoriesUseCase.execute([owner]),
      ]);

      return items
        .filter(
          (item) =>
            item.creditCardId === params.cardId &&
            item.invoiceMonth === params.month,
        )
        .map(
          (item) =>
            new TransactionUIModel(
              item.toTransactionDTO(),
              categories.find((category) => category.id === item.categoryId),
            ),
        );
    },
  });
  const owners = useOwners({ enabled: isPayOpen });
  const accounts = useQuery<AccountDTO[]>({
    cacheKey: financeKeys.accounts.raw(),
    enabled: isPayOpen && !!owners.data,
    fetch: async () =>
      useCases.getFinancialAccountsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });
  // The card's linked account prefills "Pay from" (spec 035 FR 20).
  const cards = useQuery({
    cacheKey: financeKeys.creditCards.raw(),
    enabled: isPayOpen && !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });
  const payMutation = useMutation({
    cacheKey: [useCases.payFinancialInvoiceUseCase.uniqueName],
    fetch: useCases.payFinancialInvoiceUseCase.execute,
  });
  // Spec 096 FR 19: projected purchases are resolved one by one before the invoice can be paid.
  const moveMutation = useMutation({
    cacheKey: [useCases.updateFinancialTransactionUseCase.uniqueName],
    fetch: useCases.updateFinancialTransactionUseCase.execute,
  });
  const discardMutation = useMutation({
    cacheKey: [useCases.deleteFinancialTransactionUseCase.uniqueName],
    fetch: useCases.deleteFinancialTransactionUseCase.execute,
  });
  const [discarding, setDiscarding] = useState<InvoicePurchaseUIModel>();
  const undoMutation = useMutation({
    cacheKey: [useCases.undoFinancialInvoicePaymentUseCase.uniqueName],
    fetch: useCases.undoFinancialInvoicePaymentUseCase.execute,
  });

  const activeAccounts = useMemo(
    () =>
      (accounts.data ?? []).filter((account) => account.status === "ACTIVE"),
    [accounts.data],
  );

  const linkedAccountId = cards.data?.find(
    (card) => card.id === params.cardId,
  )?.paymentAccountId;

  useEffect(() => {
    if (
      isPayOpen &&
      !accountId &&
      linkedAccountId &&
      activeAccounts.some((item) => item.id === linkedAccountId)
    ) {
      setAccountId(linkedAccountId);
    }
  }, [isPayOpen, linkedAccountId, activeAccounts]);

  useEffect(() => {
    if (payMutation.status === "success" || undoMutation.status === "success") {
      invalidateAfterPayment();
      setPayOpen(false);
      setUndoOpen(false);
      invoice.refetch();
    }
  }, [payMutation.status, undoMutation.status]);

  useEffect(() => {
    if (
      moveMutation.status === "success" ||
      discardMutation.status === "success"
    ) {
      invalidateAfterPayment();
      setDiscarding(undefined);
      invoice.refetch();
    }
  }, [moveMutation.status, discardMutation.status]);

  // The API refused the payment: the list on screen was stale.
  useEffect(() => {
    if (payMutation.error instanceof InvoiceHasProjected) {
      invoice.refetch();
    }
  }, [payMutation.error]);

  const data = invoice.data;
  const isSubmitDisabled = method === "ACCOUNT" && !accountId;

  function onPayConfirm() {
    if (!data || isSubmitDisabled) {
      return;
    }
    payMutation.mutate({
      accountId: method === "ACCOUNT" ? accountId : undefined,
      creditCardId: params.cardId,
      method,
      month: params.month,
      paidOn: toCalendarDate(paidOn),
    });
  }

  function discard(purchase: InvoicePurchaseUIModel) {
    discardMutation.mutate({
      id: purchase.id,
      ownerId: data?.ownerId as string,
      scope: purchase.recurrenceId ? "ONLY_THIS" : undefined,
    });
  }

  return {
    accountId,
    accountOptions: activeAccounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    discarding,
    errorMessage: invoice.error?.message,
    formErrorKey: getFinancialErrorMessageKey(
      payMutation.error ?? undoMutation.error,
    ),
    invoice: data,
    isLoading: invoice.isFetching && !data,
    isPaying: payMutation.isFetching,
    isPayOpen,
    isResolving: moveMutation.isFetching || discardMutation.isFetching,
    isSubmitDisabled,
    isUndoing: undoMutation.isFetching,
    isUndoOpen,
    method,
    onAccountChange: setAccountId,
    onAddPurchasePress: () => {
      replaceModal("add_new_transaction", { creditCardId: params.cardId });
    },
    onClose: () => closeModal(),
    onConfirmPress: (purchase: InvoicePurchaseUIModel) =>
      replaceModal("confirm_projected", {
        creditCardId: params.cardId,
        date: toCalendarDate(purchase.date),
        description: purchase.description,
        id: purchase.id,
        recurring: purchase.recurrenceId ? "1" : undefined,
        value: String(purchase.amountCents),
      }),
    onCreditPress: (credit: InvoiceCreditUIModel) =>
      replaceModal(
        credit.kind === "REFUND" ? "card_refund" : "card_early_payment",
        {
          accountId: credit.accountId,
          creditCardId: params.cardId,
          date: toCalendarDate(credit.date),
          description: credit.description,
          id: credit.id,
          invoiceMonth: params.month,
          method: credit.method,
          refundedPlanId: credit.refundedPlanId,
          refundedTransactionId: credit.refundedTransactionId,
          value: String(credit.amountCents),
        },
      ),
    onDiscardCancel: () => setDiscarding(undefined),
    onDiscardConfirm: () => discarding && discard(discarding),
    onEarlyPaymentPress: () =>
      replaceModal("card_early_payment", {
        creditCardId: params.cardId,
        invoiceMonth: params.month,
      }),
    onMethodChange: (value: string) =>
      setMethod(value === "EXTERNAL" ? "EXTERNAL" : "ACCOUNT"),
    onPaidOnChange: (date?: Date) => date && setPaidOn(date),
    onPayClose: () => setPayOpen(false),
    onPayConfirm,
    onPayPress: () => {
      setPayOpen(true);
    },
    onProjectedDiscard: (purchase: InvoicePurchaseUIModel) => {
      if (purchase.recurrenceId) {
        setDiscarding(purchase);

        return;
      }

      discard(purchase);
    },
    onProjectedMove: (purchase: InvoicePurchaseUIModel) =>
      moveMutation.mutate({
        id: purchase.id,
        invoiceMonth: addMonthsTo(params.month, 1),
        ownerId: data?.ownerId as string,
        scope: purchase.recurrenceId ? "ONLY_THIS" : undefined,
      }),
    onProjectedPress: (item: TransactionUIModel) =>
      replaceModal("add_new_transaction", {
        month: item.monthKey,
        occurrenceNumber: String(item.occurrenceNumber),
        recurrenceId: item.recurrenceId,
      }),
    onPurchasePress: (id: string) =>
      replaceModal("add_new_transaction", { id }),
    onRefundPress: () =>
      replaceModal("card_refund", {
        creditCardId: params.cardId,
        invoiceMonth: params.month,
      }),
    onRetry: async () => invoice.refetch(),
    onUndoCancel: () => setUndoOpen(false),
    onUndoConfirm: () =>
      undoMutation.mutate({
        creditCardId: params.cardId,
        month: params.month,
      }),
    onUndoPress: () => setUndoOpen(true),
    paidOn,
    projected: projected.data ?? [],
    projectedPurchases: data?.projectedPurchases ?? [],
  };
}
