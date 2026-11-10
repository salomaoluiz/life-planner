import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import {
  QuoteSourceUnavailable,
  TickerExists,
  TickerNotFound,
} from "@domain/entities/errors";
import { SUPPORTED_CURRENCIES } from "@domain/entities/financial/Currency";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentTickerSuggestion } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
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
const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

export default useAssetModalViewModel;

function tickerErrorKey(
  exists: boolean,
  notFound: boolean,
  validation?: TranslationKeys,
): TranslationKeys | undefined {
  if (exists) {
    return "investment.errors.tickerExists";
  }

  return notFound ? "investment.ticker.notFound" : validation;
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
  const tickerExists = error instanceof TickerExists;
  const tickerNotFound = error instanceof TickerNotFound;
  const classLocked = isEditing && (existing?.operationCount ?? 0) > 0;
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
      updateMutation.mutate(changes);
      return;
    }

    createMutation.mutate(toCreateParams(state, ownerOf(state.ownerId)));
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
    classLocked,
    classOptions: CLASS_OPTIONS.map((value) => ({
      labelKey: `investment.class.${value}` as TranslationKeys,
      value,
    })),
    currency: state?.currency ?? "BRL",
    currencyOptions: [...SUPPORTED_CURRENCIES],
    currencyReadOnly: !!market,
    currentValue: state?.currentValue ?? "",
    currentValueError: errors.currentValue,
    discardOpen,
    failure: tickerExists || tickerNotFound ? undefined : failure,
    isEditing,
    isLoading: !state && !isNotFound,
    isNotFound,
    isSaving: createMutation.isFetching || updateMutation.isFetching,
    name: state?.name ?? "",
    nameError: errors.name,
    onAssetClassChange: (value: string) =>
      state && update(withAssetClass(state, value as InvestmentAssetClass)),
    onCalculatedChange: setCalculated,
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
    tickerError: tickerErrorKey(tickerExists, tickerNotFound, errors.ticker),
    tickerRequired: state ? tickerRequired(state.assetClass) : true,
    titleKey: (isEditing
      ? "investment.form.asset.editTitle"
      : "investment.form.asset.newTitle") as TranslationKeys,
  };
}
