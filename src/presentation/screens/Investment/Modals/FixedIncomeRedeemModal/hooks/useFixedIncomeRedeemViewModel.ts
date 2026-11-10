import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  calendarDateToIso,
  todayCalendarDate,
} from "@data/models/financial/calendarDate";
import { InvestmentRedemptionTooLarge } from "@domain/entities/errors";
import { InvestmentFixedIncomeRedemptionKind } from "@domain/entities/investment/enums";
import { InvestmentFixedIncome } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import { useLocaleTag } from "@presentation/i18n";
import useDebouncedValue from "@screens/Investment/FixedIncome/hooks/useDebouncedValue";
import useEligibleAccounts from "@screens/Investment/FixedIncome/hooks/useEligibleAccounts";
import { liquidityWarningOf } from "@screens/Investment/FixedIncome/models/fixedIncome";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type FixedIncomeRedeemVM = ReturnType<
  typeof useFixedIncomeRedeemViewModel
>;

interface Edits {
  accountId?: string;
  date?: Date;
  generate?: boolean;
  kind?: InvestmentFixedIncomeRedemptionKind;
  netCents?: number;
}

export default useFixedIncomeRedeemViewModel;

// The pending card opens the modal on the maturity date; a manual open starts today.
function initialDate(day?: string): Date {
  return day ? new Date(calendarDateToIso(day)) : new Date();
}

// "TOTAL|2026-11-04|600000" -> the preview parameters (the debounced value is a primitive, so it is stable).
function parseKey(key: string) {
  const [kind, date, net] = key.split("|");

  return {
    date,
    kind: kind as InvestmentFixedIncomeRedemptionKind,
    netAmount: Number(net),
  };
}

function prefillOf(
  fixedIncome: InvestmentFixedIncome | null,
  atMaturity: boolean,
): number {
  if (!fixedIncome) {
    return 0;
  }

  return atMaturity ? fixedIncome.atMaturity.net : fixedIncome.today.net;
}

function useFixedIncomeRedeemViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{
    assetId: string;
    date?: string;
    kind?: string;
  }>();
  const assetId = params.assetId;
  const accounts = useEligibleAccounts("redeem");
  const [edits, setEdits] = useState<Edits>({});
  const [submitted, setSubmitted] = useState(false);

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(assetId), "form"],
    fetch: async () => useCases.getInvestmentAssetUseCase.execute(assetId),
  });
  const asset = detail.data;
  const fixedIncome = asset?.fixedIncome ?? null;

  const kind =
    edits.kind ??
    (params.kind === InvestmentFixedIncomeRedemptionKind.TOTAL
      ? InvestmentFixedIncomeRedemptionKind.TOTAL
      : InvestmentFixedIncomeRedemptionKind.PARTIAL);
  const date = edits.date ?? initialDate(params.date);
  const dateText = todayCalendarDate(date);
  // Spec 105 FR 31: a total redemption pre-fills the estimated net (the one at maturity for the pending card).
  const prefill = prefillOf(
    kind === InvestmentFixedIncomeRedemptionKind.TOTAL ? fixedIncome : null,
    !!params.date,
  );
  const netCents = edits.netCents ?? prefill;
  const accountId = edits.accountId ?? accounts.accounts[0]?.id;
  const generate = edits.generate ?? true;

  const key = useDebouncedValue(`${kind}|${dateText}|${netCents}`);
  const target = parseKey(key);
  const preview = useQuery({
    cacheKey: investmentKeys.fixedIncomePreview(assetId, key),
    enabled: !!asset && target.netAmount > 0,
    fetch: async () =>
      useCases.previewInvestmentFixedIncomeRedemptionUseCase.execute({
        assetId,
        ...target,
      }),
  });
  const mutation = useMutation({
    cacheKey: [
      useCases.createInvestmentFixedIncomeRedemptionUseCase.uniqueName,
    ],
    fetch: useCases.createInvestmentFixedIncomeRedemptionUseCase.execute,
  });

  useEffect(() => {
    if (mutation.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [mutation.status]);

  const tooLarge =
    preview.error instanceof InvestmentRedemptionTooLarge
      ? preview.error
      : undefined;
  const valid = netCents > 0 && (!generate || !!accountId) && !tooLarge;

  function onSave() {
    setSubmitted(true);

    if (!asset || !valid) {
      return;
    }

    mutation.mutate({
      accountId: generate ? accountId : undefined,
      assetId,
      date: dateText,
      generateTransaction: generate,
      kind,
      netAmount: netCents,
    });
  }

  function edit(change: Edits) {
    setEdits((current) => ({ ...current, ...change }));
  }

  return {
    accountId,
    accountOptions: accounts.options,
    asset,
    availableNet: tooLarge?.availableNet ?? null,
    date,
    failure: getInvestmentErrorMessage(mutation.error, (day) =>
      formatDay(day, localeTag),
    ),
    generate,
    isLoading: detail.isFetching && !asset,
    isNotFound: !!detail.error && !asset,
    isPreviewing:
      preview.isFetching ||
      (netCents > 0 && key !== `${kind}|${dateText}|${netCents}`),
    isSaving: mutation.isFetching,
    kind,
    liquidityWarning: fixedIncome
      ? liquidityWarningOf(fixedIncome, dateText)
      : null,
    netCents,
    netError: submitted && netCents <= 0,
    onAccountChange: (value: string) => edit({ accountId: value }),
    onClose: closeModal,
    onDateChange: (value?: Date) => value && edit({ date: value }),
    onGenerateChange: (value: boolean) => edit({ generate: value }),
    onKindChange: (value: string) =>
      edit({
        kind: value as InvestmentFixedIncomeRedemptionKind,
        netCents: undefined,
      }),
    onNetChange: (cents: number) => edit({ netCents: cents }),
    onSave,
    preview: tooLarge ? undefined : preview.data,
  };
}
