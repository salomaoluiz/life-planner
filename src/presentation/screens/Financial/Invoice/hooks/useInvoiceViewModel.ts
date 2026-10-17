import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  useMutation,
  useQuery,
} from "@infrastructure/fetcher";
import { toCalendarDate } from "@screens/Financial/models/creditSheet";
import CardInvoiceUIModel, {
  InvoiceCreditUIModel,
} from "@screens/Financial/Transactions/models/CardInvoiceUIModel";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

const EARLY_PAYMENT_ROUTE = "/financial/early_payment/card_early_payment";
const REFUND_ROUTE = "/financial/refund/card_refund";

type PayMethod = "ACCOUNT" | "EXTERNAL";

// Everything the invoice, the balances and the lists show changes with a payment (spec 029 FR 19-21).
function invalidateAfterPayment() {
  [
    useCases.getFinancialCardInvoiceUseCase.uniqueName,
    useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
    useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
    useCases.getFinancialAccountsUseCase.uniqueName,
    useCases.getMonthSummaryUseCase.uniqueName,
  ].forEach(async (key) => invalidateFetcherData([key]));
}

function todayDate() {
  const now = new Date();

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function useInvoiceViewModel() {
  const params = useLocalSearchParams<{ cardId: string; month: string }>();
  const [isPayOpen, setPayOpen] = useState(false);
  const [isUndoOpen, setUndoOpen] = useState(false);
  const [method, setMethod] = useState<PayMethod>("ACCOUNT");
  const [accountId, setAccountId] = useState<string>();
  const [paidOn, setPaidOn] = useState(todayDate);

  const invoice = useQuery<CardInvoiceUIModel>({
    cacheKey: [
      useCases.getFinancialCardInvoiceUseCase.uniqueName,
      params.cardId,
      params.month,
    ],
    fetch: async () =>
      new CardInvoiceUIModel(
        await useCases.getFinancialCardInvoiceUseCase.execute({
          creditCardId: params.cardId,
          month: params.month,
        }),
      ),
  });
  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    enabled: isPayOpen,
    fetch: useCases.getOwnersUseCase.execute,
  });
  const accounts = useQuery<AccountDTO[]>({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    enabled: isPayOpen && !!owners.data,
    fetch: async () =>
      useCases.getFinancialAccountsUseCase.execute(
        owners.data!.map((owner) => owner.id),
      ),
  });
  const payMutation = useMutation({
    cacheKey: [useCases.payFinancialInvoiceUseCase.uniqueName],
    fetch: useCases.payFinancialInvoiceUseCase.execute,
  });
  const undoMutation = useMutation({
    cacheKey: [useCases.undoFinancialInvoicePaymentUseCase.uniqueName],
    fetch: useCases.undoFinancialInvoicePaymentUseCase.execute,
  });

  const activeAccounts = useMemo(
    () =>
      (accounts.data ?? []).filter((account) => account.status === "ACTIVE"),
    [accounts.data],
  );

  useEffect(() => {
    if (payMutation.status === "success" || undoMutation.status === "success") {
      invalidateAfterPayment();
      setPayOpen(false);
      setUndoOpen(false);
      invoice.refetch();
    }
  }, [payMutation.status, undoMutation.status]);

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

  return {
    accountId,
    accountOptions: activeAccounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    errorMessage: invoice.error?.message,
    formErrorKey: getFinancialErrorMessageKey(
      payMutation.error ?? undoMutation.error,
    ),
    invoice: data,
    isLoading: invoice.isFetching && !data,
    isPaying: payMutation.isFetching,
    isPayOpen,
    isSubmitDisabled,
    isUndoing: undoMutation.isFetching,
    isUndoOpen,
    method,
    onAccountChange: setAccountId,
    onAddPurchasePress: () => {
      router.replace({
        params: { creditCardId: params.cardId },
        pathname: "/financial/transaction/add_new_transaction",
      } as never);
    },
    onClose: () => router.back(),
    onCreditPress: (credit: InvoiceCreditUIModel) =>
      router.replace({
        params: {
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
        pathname: credit.kind === "REFUND" ? REFUND_ROUTE : EARLY_PAYMENT_ROUTE,
      } as never),
    onEarlyPaymentPress: () =>
      router.replace({
        params: { creditCardId: params.cardId, invoiceMonth: params.month },
        pathname: EARLY_PAYMENT_ROUTE,
      } as never),
    onMethodChange: (value: string) =>
      setMethod(value === "EXTERNAL" ? "EXTERNAL" : "ACCOUNT"),
    onPaidOnChange: (date?: Date) => date && setPaidOn(date),
    onPayClose: () => setPayOpen(false),
    onPayConfirm,
    onPayPress: () => {
      setPayOpen(true);
    },
    onPurchasePress: (id: string) =>
      router.replace({
        params: { id },
        pathname: "/financial/transaction/add_new_transaction",
      } as never),
    onRefundPress: () =>
      router.replace({
        params: { creditCardId: params.cardId, invoiceMonth: params.month },
        pathname: REFUND_ROUTE,
      } as never),
    onRetry: async () => invoice.refetch(),
    onUndoCancel: () => setUndoOpen(false),
    onUndoConfirm: () =>
      undoMutation.mutate({
        creditCardId: params.cardId,
        month: params.month,
      }),
    onUndoPress: () => setUndoOpen(true),
    paidOn,
  };
}

export default useInvoiceViewModel;
