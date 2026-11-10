import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type FixedIncomeAdjustVM = ReturnType<
  typeof useFixedIncomeAdjustViewModel
>;

export default useFixedIncomeAdjustViewModel;

// Spec 105 FR 24: the gross the bank shows becomes the base of the calculation from that date on.
function useFixedIncomeAdjustViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string }>();
  const [date, setDate] = useState(new Date());
  const [gross, setGross] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const mutation = useMutation({
    cacheKey: [
      useCases.upsertInvestmentFixedIncomeAdjustmentUseCase.uniqueName,
    ],
    fetch: useCases.upsertInvestmentFixedIncomeAdjustmentUseCase.execute,
  });

  useEffect(() => {
    if (mutation.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [mutation.status]);

  const asset = detail.data;
  const dateText = todayCalendarDate(date);
  // The app only knows the curve of today (the detail is computed on read); another date shows no comparison.
  const computed =
    asset?.fixedIncome && dateText === todayCalendarDate()
      ? asset.fixedIncome.today.gross
      : null;
  const difference = computed !== null && gross > 0 ? gross - computed : null;

  function onSave() {
    setSubmitted(true);

    if (!asset || gross <= 0) {
      return;
    }

    mutation.mutate({
      assetId: asset.id,
      date: dateText,
      grossAmount: gross,
    });
  }

  return {
    asset,
    computed,
    date,
    dateText,
    difference,
    differencePercent:
      difference !== null && computed ? difference / computed : null,
    failure: getInvestmentErrorMessage(mutation.error, (day) =>
      formatDay(day, localeTag),
    ),
    gross,
    grossError: submitted && gross <= 0,
    isLoading: detail.isFetching && !asset,
    isNotFound: !!detail.error && !asset,
    isSaving: mutation.isFetching,
    onClose: closeModal,
    onDateChange: (value?: Date) => value && setDate(value),
    onGrossChange: setGross,
    onSave,
  };
}
