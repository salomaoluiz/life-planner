import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import useEligibleAccounts from "@screens/Investment/FixedIncome/hooks/useEligibleAccounts";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type FixedIncomeContributionVM = ReturnType<
  typeof useFixedIncomeContributionViewModel
>;

export default useFixedIncomeContributionViewModel;

// Spec 105 FR 13-14: a contribution is a lot with its own date; the finance entry is 102's contribution row.
function useFixedIncomeContributionViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string }>();
  const accounts = useEligibleAccounts("contribution");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date());
  const [generate, setGenerate] = useState(true);
  const [pickedAccount, setPickedAccount] = useState<string>();
  const [submitted, setSubmitted] = useState(false);

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const mutation = useMutation({
    cacheKey: [
      useCases.createInvestmentFixedIncomeContributionUseCase.uniqueName,
    ],
    fetch: useCases.createInvestmentFixedIncomeContributionUseCase.execute,
  });

  useEffect(() => {
    if (mutation.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [mutation.status]);

  const asset = detail.data;
  const accountId = pickedAccount ?? accounts.accounts[0]?.id;
  const valid = amount > 0 && (!generate || !!accountId);

  function onSave() {
    setSubmitted(true);

    if (!asset || !valid) {
      return;
    }

    mutation.mutate({
      accountId: generate ? accountId : undefined,
      amount,
      assetId: asset.id,
      date: todayCalendarDate(date),
      generateTransaction: generate,
    });
  }

  return {
    accountId,
    accountOptions: accounts.options,
    amount,
    amountError: submitted && amount <= 0,
    asset,
    date,
    failure: getInvestmentErrorMessage(mutation.error, (day) =>
      formatDay(day, localeTag),
    ),
    generate,
    isLoading: detail.isFetching && !asset,
    isNotFound: !!detail.error && !asset,
    isSaving: mutation.isFetching,
    onAccountChange: setPickedAccount,
    onAmountChange: setAmount,
    onClose: closeModal,
    onDateChange: (value?: Date) => value && setDate(value),
    onGenerateChange: setGenerate,
    onSave,
  };
}
