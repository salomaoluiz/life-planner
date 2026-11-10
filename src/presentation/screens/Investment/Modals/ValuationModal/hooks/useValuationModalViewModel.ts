import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { mulToCents, parseDecimal, ZERO } from "@utils/decimal";

export type ValuationModalVM = ReturnType<typeof useValuationModalViewModel>;

export default useValuationModalViewModel;

function useValuationModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string }>();
  const [date, setDate] = useState<Date>(new Date());
  const [unitPrice, setUnitPrice] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const mutation = useMutation({
    cacheKey: [useCases.upsertInvestmentValuationUseCase.uniqueName],
    fetch: useCases.upsertInvestmentValuationUseCase.execute,
  });

  useEffect(() => {
    if (mutation.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [mutation.status]);

  const asset = detail.data;
  const price = parseDecimal(unitPrice);
  const valid = price !== null && price > ZERO;
  const quantity = parseDecimal(asset?.position.quantity ?? "0") ?? ZERO;
  const positionText =
    asset && valid
      ? {
          price: formatUnitPrice(
            unitPrice.trim().replace(",", "."),
            asset.currency,
            localeTag,
          ),
          quantity: formatQuantity(asset.position.quantity, localeTag),
          value: formatMoney(
            mulToCents(quantity, price),
            asset.currency,
            localeTag,
          ),
        }
      : undefined;

  function onSave() {
    setSubmitted(true);

    if (!asset || !valid) {
      return;
    }

    mutation.mutate({
      assetId: asset.id,
      date: todayCalendarDate(date),
      unitPrice,
    });
  }

  return {
    date,
    failure: getInvestmentErrorMessage(mutation.error),
    isLoading: detail.isFetching && !asset,
    isNotFound: !!detail.error && !asset,
    isSaving: mutation.isFetching,
    onClose: closeModal,
    onDateChange: (value?: Date) => value && setDate(value),
    onSave,
    onUnitPriceChange: setUnitPrice,
    positionText,
    unitPrice,
    unitPriceError:
      submitted && !valid
        ? ("investment.form.operation.unitPriceInvalid" as const)
        : undefined,
  };
}
