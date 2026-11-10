import { useEffect, useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { todayCalendarDate } from "@data/models/financial/calendarDate";
import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
} from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { useLocaleTag } from "@presentation/i18n";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import {
  buildOwnerChoices,
  personalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import useDebouncedValue from "@screens/Investment/FixedIncome/hooks/useDebouncedValue";
import useEligibleAccounts from "@screens/Investment/FixedIncome/hooks/useEligibleAccounts";
import {
  defaultTaxExempt,
  emptyRateForm,
  isRateFormValid,
  RateFormState,
  toRateParams,
} from "@screens/Investment/FixedIncome/models/fixedIncome";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { formatDay } from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type FixedIncomeTitleVM = ReturnType<
  typeof useFixedIncomeTitleViewModel
>;

interface Edits {
  accountId?: string;
  amount?: number;
  date?: Date;
  generate?: boolean;
  liquidity?: InvestmentFixedIncomeLiquidity;
  liquidityDate?: Date;
  maturity?: Date;
  name?: string;
  ownerId?: string;
  product?: InvestmentFixedIncomeProduct;
  rate?: RateFormState;
  taxExempt?: boolean;
}

export default useFixedIncomeTitleViewModel;

function oneYearAfter(date: Date): Date {
  const next = new Date(date);

  next.setFullYear(next.getFullYear() + 1);

  return next;
}

// Spec 105 FR 29: product, owner, name, tax exemption, amount, date, account, maturity, liquidity and the rate; the
// estimate at maturity comes from the simulate endpoint, 400 ms after the last change.
function useFixedIncomeTitleViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const activeOwners = useActiveOwners();
  const allOwners = useOwners();
  const accounts = useEligibleAccounts("title");
  const [edits, setEdits] = useState<Edits>({});
  const [submitted, setSubmitted] = useState(false);

  const product = edits.product ?? InvestmentFixedIncomeProduct.CDB;
  const taxExempt = edits.taxExempt ?? defaultTaxExempt(product);
  const date = edits.date ?? new Date();
  const maturity = edits.maturity ?? oneYearAfter(date);
  const liquidity =
    edits.liquidity ?? InvestmentFixedIncomeLiquidity.AT_MATURITY;
  const liquidityDate = edits.liquidityDate ?? date;
  const generate = edits.generate ?? true;
  const accountId = edits.accountId ?? accounts.accounts[0]?.id;
  const rate = edits.rate ?? emptyRateForm();
  const amount = edits.amount ?? 0;
  const name = edits.name ?? "";
  const ownerId =
    edits.ownerId ??
    (activeOwners.data
      ? (personalOwnerId(activeOwners.data) ?? activeOwners.data[0]?.id ?? "")
      : "");

  const dateText = todayCalendarDate(date);
  const maturityText = todayCalendarDate(maturity);
  const liquidityText = todayCalendarDate(liquidityDate);
  const rateValid = isRateFormValid(rate);
  const maturityValid = maturityText > dateText;
  const graceValid =
    liquidity !== InvestmentFixedIncomeLiquidity.GRACE_PERIOD ||
    (liquidityText >= dateText && liquidityText <= maturityText);
  const simulable = amount > 0 && rateValid && maturityValid;

  const key = useDebouncedValue(
    JSON.stringify([amount, dateText, maturityText, taxExempt, rate]),
  );
  const simulation = useQuery({
    cacheKey: investmentKeys.fixedIncomeSimulation(key),
    enabled: simulable,
    fetch: async () => {
      const [cents, day, end, exempt, form] = JSON.parse(key) as [
        number,
        string,
        string,
        boolean,
        RateFormState,
      ];

      return useCases.simulateInvestmentFixedIncomeUseCase.execute({
        amount: cents,
        date: day,
        maturityDate: end,
        rate: toRateParams(form),
        taxExempt: exempt,
      });
    },
  });
  const createMutation = useMutation({
    cacheKey: [useCases.createInvestmentFixedIncomeTitleUseCase.uniqueName],
    fetch: useCases.createInvestmentFixedIncomeTitleUseCase.execute,
  });

  useEffect(() => {
    if (createMutation.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [createMutation.status]);

  const errors = useMemo(
    () => ({
      amount: amount <= 0,
      grace: !graceValid,
      maturity: !maturityValid,
      name: name.trim().length === 0,
      rate: !rateValid,
    }),
    [amount, graceValid, maturityValid, name, rateValid],
  );
  const hasErrors =
    Object.values(errors).some(Boolean) || (generate && !accountId);

  function edit(change: Edits) {
    setEdits((current) => ({ ...current, ...change }));
  }

  function ownerTypeOf(id: string) {
    return (
      allOwners.data?.find((owner) => owner.id === id)?.type ?? OwnerType.USER
    );
  }

  function onSave() {
    setSubmitted(true);

    if (hasErrors || !ownerId) {
      return;
    }

    createMutation.mutate({
      contribution: {
        accountId: generate ? accountId : undefined,
        amount,
        date: dateText,
        generateTransaction: generate,
      },
      name: name.trim(),
      owner: ownerTypeOf(ownerId),
      ownerId,
      rate: toRateParams(rate),
      terms: {
        liquidity,
        liquidityDate:
          liquidity === InvestmentFixedIncomeLiquidity.GRACE_PERIOD
            ? liquidityText
            : null,
        maturityDate: maturityText,
        product,
        taxExempt,
      },
    });
  }

  return {
    accountId,
    accountOptions: accounts.options,
    amount,
    date,
    errors: submitted ? errors : undefined,
    estimate: simulable ? simulation.data : undefined,
    estimateLoading:
      simulable &&
      !simulation.data &&
      (simulation.isFetching ||
        key !==
          JSON.stringify([amount, dateText, maturityText, taxExempt, rate])),
    failure: getInvestmentErrorMessage(createMutation.error, (day) =>
      formatDay(day, localeTag),
    ),
    generate,
    isSaving: createMutation.isFetching,
    liquidity,
    liquidityDate,
    maturity,
    name,
    onAccountChange: (value: string) => edit({ accountId: value }),
    onAmountChange: (cents: number) => edit({ amount: cents }),
    onClose: closeModal,
    onDateChange: (value?: Date) => value && edit({ date: value }),
    onGenerateChange: (value: boolean) => edit({ generate: value }),
    onLiquidityChange: (value: string) =>
      edit({ liquidity: value as InvestmentFixedIncomeLiquidity }),
    onLiquidityDateChange: (value?: Date) =>
      value && edit({ liquidityDate: value }),
    onMaturityChange: (value?: Date) => value && edit({ maturity: value }),
    onNameChange: (value: string) => edit({ name: value }),
    onOwnerChange: (value: string) => edit({ ownerId: value }),
    onProductChange: (value: string) => {
      const next = value as InvestmentFixedIncomeProduct;

      // The switch is pre-filled again only when the product changes in the form (FR 2).
      edit({ product: next, taxExempt: defaultTaxExempt(next) });
    },
    onRateChange: (value: RateFormState) => edit({ rate: value }),
    onSave,
    onTaxExemptChange: (value: boolean) => edit({ taxExempt: value }),
    ownerChoices: buildOwnerChoices(activeOwners.data ?? []),
    ownerId,
    product,
    rate,
    taxExempt,
  };
}
