import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  QuoteSourceUnavailable,
  TickerClassMismatch,
  TickerExists,
  TickerNotFound,
} from "@domain/entities/errors";
import { SUPPORTED_CURRENCIES } from "@domain/entities/financial/Currency";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentTickerSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { UpdateInvestmentAssetParams } from "@domain/repositories/investment";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";
import { TranslationKeys } from "@presentation/i18n/types";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import {
  buildOwnerChoices,
  personalOwnerId,
} from "@screens/Financial/models/ownerOptions";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

import {
  AssetFormState,
  createInitialState,
  isSameState,
  marketOf,
  stateFromAsset,
  tickerRequired,
  toCreateParams,
  toUpdateParams,
  validate,
  withAssetClass,
  withCurrency,
  withName,
  withPicked,
  withTicker,
} from "../models/assetFormState";

export type AssetModalVM = ReturnType<typeof useAssetModalViewModel>;

const CLASS_OPTIONS = Object.values(InvestmentAssetClass);
// Spec 111 rule 15: with operations only the two B3 classes can swap.
const B3_CLASSES = [
  InvestmentAssetClass.BR_STOCK,
  InvestmentAssetClass.BR_REIT,
];
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

export default useAssetModalViewModel;

function tickerErrorKey(
  error: unknown,
  validation?: TranslationKeys,
): TranslationKeys | undefined {
  if (error instanceof TickerExists) {
    return "investment.errors.tickerExists";
  }
  if (error instanceof TickerNotFound) {
    return "investment.ticker.notFound";
  }
  if (error instanceof TickerClassMismatch) {
    return `investment.ticker.classMismatch.${error.expectedClass}` as TranslationKeys;
  }

  return validation;
}

function useAssetModalViewModel() {
  const { closeModal, replaceModal } = useModalNavigation();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!params.id;
  const activeOwners = useActiveOwners();
  const allOwners = useOwners();

  const detail = useQuery({
    cacheKey: [...investmentKeys.asset(params.id ?? ""), "form"],
    enabled: isEditing,
    fetch: async () => useCases.getInvestmentAssetUseCase.execute(params.id!),
  });
  const existing = detail.data;
  const isNotFound = isEditing && !!detail.error && !existing;

  const initial = useMemo(() => {
    if (isEditing) {
      return existing ? stateFromAsset(existing) : undefined;
    }
    if (!activeOwners.data) {
      return undefined;
    }

    return createInitialState({
      ownerId: personalOwnerId(activeOwners.data) ?? activeOwners.data[0]?.id,
    });
  }, [isEditing, existing, activeOwners.data]);

  const [edited, setEdited] = useState<AssetFormState>();
  const [submitted, setSubmitted] = useState(false);
  const [discardOpen, setDiscardOpen] = useState(false);
  // Spec 111 rule 16: the update waiting for the "change class" confirmation.
  const [pendingChange, setPendingChange] =
    useState<UpdateInvestmentAssetParams>();
  // Spec 105 FR 29: a new fixed income asset is calculated from the rate by default.
  const [calculated, setCalculated] = useState(true);
  const state = edited ?? initial;
  const market = state ? marketOf(state.assetClass) : undefined;
  const typed = state?.ticker.trim() ?? "";
  const [query, setQuery] = useState("");
  const isDirty = !!edited && !!initial && !isSameState(edited, initial);

  // Spec 104 FR 23: the search waits 300 ms after the last key.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [typed]);

  const searchable =
    !!market &&
    query.length >= SEARCH_MIN_LENGTH &&
    query === typed &&
    state?.picked?.ticker !== typed;
  const search = useQuery({
    cacheKey: investmentKeys.tickerSearch(market ?? "none", query),
    enabled: searchable,
    fetch: async () =>
      useCases.searchInvestmentTickersUseCase.execute({
        market: market!,
        q: query,
      }),
  });
  const suggestions: InvestmentTickerSuggestion[] = searchable
    ? (search.data ?? [])
    : [];

  const createMutation = useMutation({
    cacheKey: [useCases.createInvestmentAssetUseCase.uniqueName],
    fetch: useCases.createInvestmentAssetUseCase.execute,
  });
  const updateMutation = useMutation({
    cacheKey: [useCases.updateInvestmentAssetUseCase.uniqueName],
    fetch: useCases.updateInvestmentAssetUseCase.execute,
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

  const error = createMutation.error ?? updateMutation.error;
  const errors = submitted && state ? validate(state, initial) : {};
  const failure = getInvestmentErrorMessage(error);
  const tickerFailure =
    error instanceof TickerExists ||
    error instanceof TickerNotFound ||
    error instanceof TickerClassMismatch;
  const hasOperations = isEditing && (existing?.operationCount ?? 0) > 0;
  const swapsOnly =
    hasOperations && !!existing && B3_CLASSES.includes(existing.assetClass);
  const classLocked = hasOperations && !swapsOnly;
  let classHintKey: TranslationKeys = "investment.form.asset.classHint";

  if (classLocked) {
    classHintKey = "investment.errors.classLocked";
  } else if (swapsOnly) {
    classHintKey = "investment.form.asset.classHintLocked";
  }
  function ownerOf(ownerId: string) {
    return (
      allOwners.data?.find((owner) => owner.id === ownerId)?.type ??
      OwnerType.USER
    );
  }

  function update(next: AssetFormState) {
    setEdited(next);
  }

  function onSave() {
    // The calculated flow has its own modal with the terms, the rate and the first contribution.
    if (
      !isEditing &&
      state?.assetClass === InvestmentAssetClass.FIXED_INCOME &&
      calculated
    ) {
      replaceModal("investment_fixed_income");
      return;
    }

    setSubmitted(true);

    if (!state || !initial || Object.keys(validate(state, initial)).length) {
      return;
    }

    if (isEditing) {
      const changes = toUpdateParams(
        params.id!,
        state,
        initial,
        ownerOf(state.ownerId),
      );

      if (Object.keys(changes).length === 1) {
        closeModal();
        return;
      }
      // Moving an asset with operations to the other class asks first (spec 111 rule 16).
      if (changes.assetClass && hasOperations) {
        setPendingChange(changes);
        return;
      }
      updateMutation.mutate(changes);
      return;
    }

    createMutation.mutate(toCreateParams(state, ownerOf(state.ownerId)));
  }

  function onClassChangeConfirm() {
    if (pendingChange) {
      updateMutation.mutate(pendingChange);
    }
    setPendingChange(undefined);
  }

  function onClose() {
    if (isDirty) {
      setDiscardOpen(true);
      return;
    }
    closeModal();
  }

  const showCalculated =
    !isEditing && state?.assetClass === InvestmentAssetClass.FIXED_INCOME;

  return {
    assetClass: state?.assetClass ?? InvestmentAssetClass.BR_STOCK,
    calculated: showCalculated && calculated,
    classChange: pendingChange?.assetClass
      ? {
          classKey:
            `investment.class.${pendingChange.assetClass}` as TranslationKeys,
          ticker: state?.ticker ?? "",
        }
      : null,
    classHintKey,
    classLocked,
    classNotice: state?.classNotice
      ? {
          key: `investment.ticker.classAdjusted.${state.classNotice}` as TranslationKeys,
          ticker: state.ticker,
        }
      : null,
    classOptions: CLASS_OPTIONS.filter(
      (value) => !swapsOnly || B3_CLASSES.includes(value),
    ).map((value) => ({
      labelKey: `investment.class.${value}` as TranslationKeys,
      value,
    })),
    currency: state?.currency ?? "BRL",
    currencyOptions: [...SUPPORTED_CURRENCIES],
    currencyReadOnly: !!market,
    currentValue: state?.currentValue ?? "",
    currentValueError: errors.currentValue,
    discardOpen,
    failure: tickerFailure ? undefined : failure,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    name: state?.name ?? "",
    nameError: errors.name,
    onAssetClassChange: (value: string) =>
      state && update(withAssetClass(state, value as InvestmentAssetClass)),
    onCalculatedChange: setCalculated,
    onClassChangeCancel: () => setPendingChange(undefined),
    onClassChangeConfirm,
    onClose,
    onCurrencyChange: (value: string) =>
      state && update(withCurrency(state, value as AssetFormState["currency"])),
    onCurrentValueChange: (value: string) =>
      state && update({ ...state, currentValue: value }),
    onDiscardCancel: () => setDiscardOpen(false),
    onDiscardConfirm: () => closeModal(),
    onNameChange: (value: string) => state && update(withName(state, value)),
    onOwnerChange: (value: string) =>
      state && update({ ...state, ownerId: value }),
    onSave,
    onTickerChange: (value: string) =>
      state && update(withTicker(state, value)),
    onTickerSelect: (ticker: string) => {
      const picked = suggestions.find((item) => item.ticker === ticker);

      if (state && picked) {
        update(withPicked(state, picked));
      }
    },
    ownerChoices: buildOwnerChoices(activeOwners.data ?? []),
    ownerId: state?.ownerId ?? "",
    pickedQuote: state?.picked ?? null,
    quotedMarket: market ?? null,
    searchUnavailable: search.error instanceof QuoteSourceUnavailable,
    showCalculated,
    suggestions,
    ticker: state?.ticker ?? "",
    tickerError: tickerErrorKey(error, errors.ticker),
    tickerRequired: state ? tickerRequired(state.assetClass) : true,
    titleKey: (isEditing
      ? "investment.form.asset.editTitle"
      : "investment.form.asset.newTitle") as TranslationKeys,
  };
}
