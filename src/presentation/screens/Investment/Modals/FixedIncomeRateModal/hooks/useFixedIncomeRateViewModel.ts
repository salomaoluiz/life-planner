import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  calendarDateToIso,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import {
  emptyRateForm,
  isRateFormValid,
  latestRate,
  rateFormFrom,
  RateFormState,
  toRateParams,
} from "@screens/Investment/FixedIncome/models/fixedIncome";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type FixedIncomeRateVM = ReturnType<typeof useFixedIncomeRateViewModel>;

export default useFixedIncomeRateViewModel;

// Spec 105 FR 6-9: "Update rate" adds an entry from a date (the form starts from the latest one); opened with a
// `rateId` it edits that entry instead. The API derives the effective rate; the form only previews it.
function useFixedIncomeRateViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string; rateId?: string }>();
  const isEditing = !!params.rateId;
  const [edits, setEdits] = useState<{
    form?: RateFormState;
    startDate?: Date;
  }>({});
  const [submitted, setSubmitted] = useState(false);

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const createMutation = useMutation({
    cacheKey: [useCases.createInvestmentFixedIncomeRateUseCase.uniqueName],
    fetch: useCases.createInvestmentFixedIncomeRateUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateInvestmentFixedIncomeRateUseCase.uniqueName],
    fetch: useCases.updateInvestmentFixedIncomeRateUseCase.execute,
  });

  useEffect(() => {
    if (
      createMutation.status === "success" ||
      updateMutation.status === "success"
    ) {
      void invalidateInvestments();
      closeModal();
    }
  }, [createMutation.status, updateMutation.status]);

  const asset = detail.data;
  const fixedIncome = asset?.fixedIncome ?? null;
  const existing = fixedIncome?.rates.find((rate) => rate.id === params.rateId);
  const isNotFound =
    (!!detail.error && !asset) || (isEditing && !!asset && !existing);
  const base = existing ?? (fixedIncome ? latestRate(fixedIncome) : undefined);
  const form = edits.form ?? (base ? rateFormFrom(base) : emptyRateForm());
  const startDate =
    edits.startDate ??
    (existing ? new Date(calendarDateToIso(existing.startDate)) : new Date());
  const startText = todayCalendarDate(startDate);
  const valid = isRateFormValid(form);
  const history = [...(fixedIncome?.rates ?? [])]
    .filter((rate) => rate.id !== params.rateId)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  function onSave() {
    setSubmitted(true);

    if (!asset || !valid) {
      return;
    }

    const rate = toRateParams(form, startText);

    if (existing) {
      updateMutation.mutate({ id: existing.id, rate });
      return;
    }

    createMutation.mutate({ assetId: asset.id, rate });
  }

  return {
    asset,
    failure: getInvestmentErrorMessage(
      createMutation.error ?? updateMutation.error,
      (day) => formatDay(day, localeTag),
    ),
    form,
    history,
    invalid: submitted && !valid,
    isEditing,
    isLoading: detail.isFetching && !asset,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    onClose: closeModal,
    onFormChange: (next: RateFormState) =>
      setEdits((current) => ({ ...current, form: next })),
    onSave,
    onStartDateChange: (value?: Date) =>
      value && setEdits((current) => ({ ...current, startDate: value })),
    startDate,
    startText,
  };
}
