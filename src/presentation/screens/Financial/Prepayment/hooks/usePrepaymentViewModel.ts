import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import InstallmentPlanDTO from "@application/dto/financial/InstallmentPlanDTO";
import PrepaymentPreviewDTO from "@application/dto/financial/PrepaymentPreviewDTO";
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

import { resultingTotal, summaryOf, validate } from "../models/prepaymentState";

// A prepayment moves installments between invoices: refresh everything that shows them (spec 032).
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

function usePrepaymentViewModel() {
  const params = useLocalSearchParams<{ planId: string }>();
  const [targetMonth, setTargetMonth] = useState<string>();
  const [hasDiscount, setHasDiscount] = useState(false);
  const [discountCents, setDiscountCents] = useState(0);
  const [date, setDate] = useState(todayDate);
  const [submitted, setSubmitted] = useState(false);

  const plan = useQuery<InstallmentPlanDTO>({
    cacheKey: [
      useCases.getFinancialInstallmentPlanUseCase.uniqueName,
      params.planId,
    ],
    fetch: async () =>
      useCases.getFinancialInstallmentPlanUseCase.execute(params.planId),
  });
  const overview = useQuery<CreditCardOverviewDTO>({
    cacheKey: [useCases.getFinancialCreditCardsOverviewUseCase.uniqueName],
    enabled: !!plan.data,
    fetch: async () => {
      const owners = await useCases.getOwnersUseCase.execute();

      return useCases.getFinancialCreditCardsOverviewUseCase.execute(
        owners.map((owner) => owner.id),
      );
    },
  });

  const summary = overview.data?.cards.find(
    (item) => item.card.id === plan.data?.creditCardId,
  );
  const invoices = useMemo(() => assignableInvoices(summary), [summary]);
  const resolvedMonth = targetMonth ?? invoices[0]?.month;
  const target = invoices.find((invoice) => invoice.month === resolvedMonth);

  const preview = useQuery<PrepaymentPreviewDTO>({
    cacheKey: [
      useCases.previewFinancialPrepaymentUseCase.uniqueName,
      params.planId,
      resolvedMonth ?? "",
    ],
    enabled: !!resolvedMonth,
    fetch: async () =>
      useCases.previewFinancialPrepaymentUseCase.execute({
        planId: params.planId,
        targetInvoiceMonth: resolvedMonth as string,
      }),
  });
  const prepayMutation = useMutation({
    cacheKey: [useCases.prepayFinancialInstallmentPlanUseCase.uniqueName],
    fetch: useCases.prepayFinancialInstallmentPlanUseCase.execute,
  });

  useEffect(() => {
    if (prepayMutation.status === "success") {
      invalidateAfterWrite();
      router.back();
    }
  }, [prepayMutation.status]);

  const movedCents = preview.data?.total ?? 0;
  const errors = validate({ discountCents, hasDiscount }, movedCents);
  const eligible = preview.data?.eligible ?? [];

  function onConfirm() {
    setSubmitted(true);

    if (
      !resolvedMonth ||
      eligible.length === 0 ||
      Object.keys(errors).length > 0
    ) {
      return;
    }

    prepayMutation.mutate({
      date: toCalendarDate(date),
      discount: hasDiscount ? discountCents : undefined,
      planId: params.planId,
      targetInvoiceMonth: resolvedMonth,
    });
  }

  return {
    currency: plan.data?.currency ?? DEFAULT_CURRENCY,
    date,
    discountCents,
    errors: submitted ? errors : {},
    formErrorKey: getFinancialErrorMessageKey(
      preview.error ?? prepayMutation.error,
    ),
    hasDiscount,
    invoices,
    isEmpty: !!preview.data && eligible.length === 0,
    isLoading: !plan.data || !overview.data,
    isPreviewing: preview.isFetching && !preview.data,
    isSaving: prepayMutation.isFetching,
    movedCents,
    onClose: () => router.back(),
    onConfirm,
    onDateChange: (value?: Date) => value && setDate(value),
    onDiscountChange: setDiscountCents,
    onHasDiscountChange: setHasDiscount,
    onTargetChange: setTargetMonth,
    planDescription: plan.data?.description ?? "",
    resultingTotalCents: resultingTotal(
      target?.totalCents ?? 0,
      movedCents,
      hasDiscount ? discountCents : 0,
    ),
    summary:
      eligible.length > 0 && plan.data
        ? summaryOf(eligible, plan.data.installmentCount)
        : undefined,
    targetMonth: resolvedMonth,
  };
}

export default usePrepaymentViewModel;
