import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import CreditCardOverviewDTO from "@application/dto/financial/CreditCardOverviewDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { useCases } from "@application/useCases";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  centsToDecimal,
  chargedInvoiceMonth,
  differenceCents,
  isValidCharge,
} from "../models/confirmProjectedState";

type ConfirmParams = {
  creditCardId: string;
  // `YYYY-MM-DD` of the projected purchase.
  date: string;
  description: string;
  id: string;
  // "1" WHEN the purchase belongs to a series (the next ones stay projected).
  recurring?: string;
  // Cents, as text.
  value: string;
};

function parseDate(value?: string) {
  if (!value) {
    const now = new Date();

    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}

// Spec 096 FR 18: the real value and date of a projected card purchase.
function useConfirmProjectedViewModel() {
  const { closeModal } = useModalNavigation();
  const params = useLocalSearchParams<ConfirmParams>();
  const projectedCents = Number(params.value ?? 0);
  const [amountCents, setAmountCents] = useState(projectedCents);
  const [date, setDate] = useState(() => parseDate(params.date));
  const [submitted, setSubmitted] = useState(false);

  const owners = useOwners();
  const overview = useQuery<CreditCardOverviewDTO>({
    cacheKey: financeKeys.creditCardsOverview.raw(),
    enabled: !!owners.data,
    fetch: async () =>
      useCases.getFinancialCreditCardsOverviewUseCase.execute(
        (owners.data ?? []).map((owner) => owner.id),
      ),
  });
  const confirmMutation = useMutation({
    cacheKey: [useCases.confirmFinancialTransactionUseCase.uniqueName],
    fetch: useCases.confirmFinancialTransactionUseCase.execute,
  });

  useEffect(() => {
    if (confirmMutation.status === "success") {
      void invalidateFinanceData();
      closeModal();
    }
  }, [confirmMutation.status]);

  const card = overview.data?.cards.find(
    (item) => item.card.id === params.creditCardId,
  )?.card;

  function onConfirm() {
    setSubmitted(true);

    if (!card || !isValidCharge(amountCents)) {
      return;
    }

    confirmMutation.mutate({
      date: date.toISOString(),
      id: params.id,
      ownerId: card.ownerId,
      value: centsToDecimal(amountCents),
    });
  }

  return {
    amountCents,
    amountError:
      submitted && !isValidCharge(amountCents)
        ? ("financial.projected.confirm.errors.amount" as const)
        : undefined,
    card,
    currency: card?.currency ?? DEFAULT_CURRENCY,
    date,
    description: params.description ?? "",
    differenceCents: differenceCents(amountCents, projectedCents),
    formErrorKey: getFinancialErrorMessageKey(confirmMutation.error),
    invoiceMonth: card ? chargedInvoiceMonth(date, card.closingDay) : undefined,
    isLoading: !overview.data,
    isRecurring: params.recurring === "1",
    isSaving: confirmMutation.isFetching,
    onAmountChange: setAmountCents,
    onClose: () => closeModal(),
    onConfirm,
    onDateChange: (value?: Date) => value && setDate(value),
    projectedCents,
    projectedDate: parseDate(params.date),
  };
}

export default useConfirmProjectedViewModel;
