import { useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { financeKeys } from "@application/queryKeys/financeKeys";
import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { useCases } from "@application/useCases";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { previewConversion } from "@domain/entities/investment/conversion";
import {
  InvestmentAssetStatus,
  InvestmentPriceKind,
  InvestmentPriceRange,
  InvestmentQuoteMarket,
  QUOTED_CLASS_MARKET,
} from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentConversion,
  InvestmentTickerSuggestion,
} from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import { useLocaleTag } from "@presentation/i18n";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatUnitPrice,
} from "@screens/Investment/models/format";
import getInvestmentErrorMessage from "@screens/Investment/utils/investmentErrorMessage";
import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";
import { formatDecimal, parseDecimal } from "@utils/decimal";

import {
  ConversionFormState,
  DestinationMode,
  eligibleDestinations,
  hasErrors,
  toDay,
  validateConversion,
} from "../models/conversionForm";

export type ConversionModalVM = ReturnType<typeof useConversionModalViewModel>;

interface AccountsData {
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_MIN_LENGTH = 2;

export default useConversionModalViewModel;

function dayToDate(day: string): Date {
  const [year, month, date] = day.split("-").map(Number);

  return new Date(year, month - 1, date);
}

// Spec 112 section 8: converts the whole position of an asset (or edits an existing conversion) into another asset of
// the same class; the preview is computed here with `previewConversion`, the API answer is the source of truth.
function destinationTickerOf(input: {
  conversion: InvestmentConversion | undefined;
  destination: InvestmentAsset | undefined;
  isEdit: boolean;
  mode: DestinationMode;
  typed: string;
}): string {
  if (input.isEdit) {
    return input.conversion?.to.ticker ?? "";
  }
  if (input.mode === "new") {
    return input.typed.toUpperCase();
  }

  return input.destination?.ticker ?? input.destination?.name ?? "";
}

// The origin side of the preview: the whole position, or the stored `costOut` snapshot of a conversion being edited.
function originPositionOf(
  detail: InvestmentAsset | undefined,
  conversion: InvestmentConversion | undefined,
  isEdit: boolean,
): undefined | { cost: number; quantity: string } {
  if (isEdit) {
    return conversion
      ? { cost: conversion.from.cost, quantity: conversion.from.quantity }
      : undefined;
  }

  return detail
    ? { cost: detail.position.cost, quantity: detail.position.quantity }
    : undefined;
}

function positionBefore(
  destination: InvestmentAsset | undefined,
  conversion: InvestmentConversion | undefined,
): null | { cost: number; quantity: string } {
  if (!destination) {
    return null;
  }
  if (!conversion) {
    return {
      cost: destination.position.cost,
      quantity: destination.position.quantity,
    };
  }

  return {
    cost:
      destination.position.cost -
      (conversion.to.cost - conversion.to.fractionCost),
    quantity: formatDecimal(
      (parseDecimal(destination.position.quantity) ?? BigInt(0)) -
        (parseDecimal(conversion.to.quantity) ?? BigInt(0)),
    ),
  };
}

// "7.4" -> "7,4": the form shows decimals the way the owner types them.
function toInput(value: string, localeTag: string): string {
  return localeTag.startsWith("pt") ? value.replace(".", ",") : value;
}

function useConversionModalViewModel() {
  const { closeModal } = useModalNavigation();
  const localeTag = useLocaleTag();
  const params = useLocalSearchParams<{ assetId: string; id?: string }>();
  const isEdit = !!params.id;

  const origin = useQuery({
    cacheKey: [...investmentKeys.asset(params.assetId), "conversion-form"],
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(params.assetId),
  });
  const conversionQuery = useQuery({
    cacheKey: [...investmentKeys.all(), "conversion", params.id ?? "new"],
    enabled: isEdit,
    fetch: async () =>
      useCases.getInvestmentConversionUseCase.execute(params.id!),
  });
  const candidatesQuery = useQuery({
    cacheKey: [
      ...investmentKeys.assets(InvestmentAssetStatus.ACTIVE),
      "conversion",
    ],
    enabled: !isEdit,
    fetch: async () =>
      useCases.getInvestmentAssetsUseCase.execute({
        status: InvestmentAssetStatus.ACTIVE,
      }),
  });
  const editedDestinationId = conversionQuery.data?.to.assetId;
  const destinationDetail = useQuery({
    cacheKey: [
      ...investmentKeys.asset(editedDestinationId ?? "none"),
      "conversion-form",
    ],
    enabled: !!editedDestinationId,
    fetch: async () =>
      useCases.getInvestmentAssetUseCase.execute(editedDestinationId!),
  });
  const accountsQuery = useOwnerScopedQuery<AccountsData>({
    cacheKey: financeKeys.accounts.raw("investment-conversion"),
    fetch: async (owners) => ({
      accounts: await useCases.getFinancialAccountsUseCase.execute(
        owners.map((owner) => owner.id),
      ),
      owners,
    }),
  });
  const create = useMutation({
    cacheKey: [useCases.createInvestmentConversionUseCase.uniqueName],
    fetch: useCases.createInvestmentConversionUseCase.execute,
  });
  const update = useMutation({
    cacheKey: [useCases.updateInvestmentConversionUseCase.uniqueName],
    fetch: useCases.updateInvestmentConversionUseCase.execute,
  });

  const detail = origin.data;
  const conversion = conversionQuery.data;
  const currency = (detail?.currency ?? "BRL") as CurrencyCode;
  const candidates = useMemo(
    () =>
      detail ? eligibleDestinations(detail, candidatesQuery.data ?? []) : [],
    [detail, candidatesQuery.data],
  );
  const accounts = useMemo(() => {
    const archivedOwners = new Set(
      (accountsQuery.data?.owners ?? [])
        .filter((owner) => owner.archived)
        .map((owner) => owner.id),
    );

    return (accountsQuery.data?.accounts ?? [])
      .filter(
        (account) =>
          account.status === "ACTIVE" &&
          account.currency === currency &&
          !archivedOwners.has(account.ownerId),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [accountsQuery.data, currency]);

  const outOperation = detail?.operations.find(
    (operation) => operation.conversion && operation.type === "CONVERSION_OUT",
  );
  // The form starts from the conversion being edited, or from the defaults; what the owner types replaces it.
  const initial: ConversionFormState = {
    accountId: outOperation?.accountId ?? accounts[0]?.id ?? "",
    cashAmount: conversion?.cashAmount ?? 0,
    date: conversion ? dayToDate(conversion.date) : new Date(),
    destinationId: candidates[0]?.id ?? "",
    mode: "existing",
    name: "",
    ratioFrom: conversion ? toInput(conversion.ratioFrom, localeTag) : "1",
    ratioTo: conversion ? toInput(conversion.ratioTo, localeTag) : "1",
    referenceValue: conversion?.cashReferenceUnitValue
      ? toInput(conversion.cashReferenceUnitValue, localeTag)
      : "",
    ticker: "",
  };
  const [edited, setEdited] = useState<Partial<ConversionFormState>>({});
  const state: ConversionFormState = { ...initial, ...edited };
  const [submitted, setSubmitted] = useState(false);

  function change(patch: Partial<ConversionFormState>) {
    setEdited((current) => ({ ...current, ...patch }));
  }

  const market = QUOTED_CLASS_MARKET[
    detail?.assetClass ?? ("PRIVATE" as never)
  ] as InvestmentQuoteMarket | undefined;
  const typed = state.ticker.trim();
  const [query, setQuery] = useState("");

  // Spec 104 FR 23: the search waits 300 ms after the last key.
  useEffect(() => {
    const timer = setTimeout(() => setQuery(typed), SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [typed]);

  const searchable =
    !isEdit &&
    state.mode === "new" &&
    !!market &&
    query.length >= SEARCH_MIN_LENGTH &&
    query === typed;
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

  const destination = isEdit
    ? destinationDetail.data
    : candidates.find((candidate) => candidate.id === state.destinationId);
  const hasCash = state.cashAmount > 0;
  const history = useQuery({
    cacheKey: investmentKeys.priceHistory(
      destination?.id ?? "none",
      InvestmentPriceRange.ONE_MONTH,
    ),
    enabled: hasCash && !!destination && state.mode === "existing",
    fetch: async () =>
      useCases.getInvestmentPriceHistoryUseCase.execute({
        id: destination!.id,
        range: InvestmentPriceRange.ONE_MONTH,
      }),
  });
  // Spec 112 FR 14: prefilled with the stored close of the destination on or before the date (editable).
  const day = toDay(state.date);
  const close = (history.data?.points ?? [])
    .filter(
      (point) => point.kind === InvestmentPriceKind.CLOSE && point.date <= day,
    )
    .sort((a, b) => b.date.localeCompare(a.date))[0]?.price;
  const suggestedReference =
    close ?? destination?.position.currentUnitPrice ?? "";
  const referenceValue =
    state.referenceValue === ""
      ? toInput(suggestedReference, localeTag)
      : state.referenceValue;

  useEffect(() => {
    if (create.status === "success" || update.status === "success") {
      void invalidateInvestments();
      closeModal();
    }
  }, [create.status, update.status]);

  // The destination as it is BEFORE this conversion: when editing, the IN is taken back out of its position.
  const destinationBefore = positionBefore(
    destination,
    isEdit ? conversion : undefined,
  );
  const originPosition = originPositionOf(
    detail,
    isEdit ? conversion : undefined,
    isEdit,
  );
  const referenceValid =
    !hasCash || (parseDecimal(referenceValue) ?? BigInt(0)) > BigInt(0);
  const preview =
    detail && originPosition && referenceValid
      ? previewConversion({
          assetClass: detail.assetClass,
          cash: hasCash
            ? { amount: state.cashAmount, referenceUnitValue: referenceValue }
            : null,
          destination: state.mode === "existing" ? destinationBefore : null,
          origin: originPosition,
          ratioFrom: state.ratioFrom,
          ratioTo: state.ratioTo,
        })
      : null;
  const errors = submitted
    ? validateConversion({ ...state, referenceValue }, isEdit)
    : validateConversion({ ...state, referenceValue }, isEdit);
  const visibleErrors = submitted
    ? errors
    : {
        account: false,
        date: errors.date,
        destination: false,
        name: false,
        ratioFrom: false,
        ratioTo: false,
        referenceValue: false,
        ticker: false,
      };
  const originTicker = detail?.ticker ?? detail?.name ?? "";
  const destinationTicker = destinationTickerOf({
    conversion,
    destination,
    isEdit,
    mode: state.mode,
    typed,
  });

  function onSubmit() {
    setSubmitted(true);

    if (!detail || hasErrors(errors)) {
      return;
    }

    const cash = hasCash
      ? {
          accountId: state.accountId,
          cashAmount: state.cashAmount,
          cashReferenceUnitValue: referenceValue,
          generateTransaction: true,
        }
      : { generateTransaction: false };

    if (isEdit && conversion) {
      update.mutate({
        accountId: hasCash ? state.accountId : undefined,
        cashAmount: hasCash ? state.cashAmount : null,
        cashReferenceUnitValue: hasCash ? referenceValue : undefined,
        date: toDay(state.date),
        generateTransaction: hasCash,
        id: conversion.id,
        ratioFrom: state.ratioFrom,
        ratioTo: state.ratioTo,
      });

      return;
    }

    create.mutate({
      assetId: detail.id,
      date: toDay(state.date),
      destination:
        state.mode === "existing"
          ? { assetId: state.destinationId }
          : { newAsset: { name: state.name.trim(), ticker: typed } },
      ratioFrom: state.ratioFrom,
      ratioTo: state.ratioTo,
      ...cash,
    });
  }

  function money(cents: number) {
    return formatMoney(cents, currency, localeTag);
  }

  const failure = getInvestmentErrorMessage(
    create.error ?? update.error,
    (value) => formatDay(value, localeTag),
  );

  return {
    accountId: state.accountId,
    accountOptions: accounts.map((account) => ({
      label: account.name,
      value: account.id,
    })),
    assetClass: detail?.assetClass,
    cashAmount: state.cashAmount,
    currency,
    date: state.date,
    destinationId: state.destinationId,
    destinationOptions: candidates.map((candidate) => ({
      label: `${candidate.ticker ?? candidate.name} · ${formatQuantity(
        candidate.position.quantity,
        localeTag,
      )}`,
      value: candidate.id,
    })),
    destinationTicker,
    errors: visibleErrors,
    failure,
    hasCash,
    isEdit,
    isLoading:
      (origin.isFetching && !detail) ||
      (isEdit && conversionQuery.isFetching && !conversion),
    isNotFound:
      (!!origin.error && !detail) ||
      (isEdit && !!conversionQuery.error && !conversion),
    isSaving: create.isFetching || update.isFetching,
    mode: state.mode,
    name: state.name,
    onAccountChange: (value: string) => change({ accountId: value }),
    onCashChange: (cents?: number) => change({ cashAmount: cents ?? 0 }),
    onClose: closeModal,
    onDateChange: (value?: Date) => value && change({ date: value }),
    onDestinationChange: (value: string) => change({ destinationId: value }),
    onModeChange: (value: string) => change({ mode: value as DestinationMode }),
    onNameChange: (value: string) => change({ name: value }),
    onRatioFromChange: (value: string) => change({ ratioFrom: value }),
    onRatioToChange: (value: string) => change({ ratioTo: value }),
    onReferenceChange: (value: string) => change({ referenceValue: value }),
    onSubmit,
    onTickerChange: (value: string) => change({ ticker: value.toUpperCase() }),
    onTickerSelect: (ticker: string) => {
      const picked = suggestions.find((item) => item.ticker === ticker);

      change({
        name: state.name === "" ? (picked?.name ?? "") : state.name,
        ticker,
      });
    },
    originTicker,
    preview: preview
      ? {
          averagePriceAfter: preview.destinationAfter.averagePrice
            ? formatUnitPrice(
                preview.destinationAfter.averagePrice,
                currency,
                localeTag,
              )
            : "—",
          cashCost: money(preview.cashCost),
          costAfter: money(preview.destinationAfter.cost),
          costBefore: money(destinationBefore?.cost ?? 0),
          costOrigin: money(originPosition?.cost ?? 0),
          fractionCost: money(preview.fractionCost),
          fractionQuantity: formatQuantity(preview.fractionQuantity, localeTag),
          hasFraction: preview.fractionQuantity !== "0",
          quantityAfter: formatQuantity(
            preview.destinationAfter.quantity,
            localeTag,
          ),
          quantityBefore: formatQuantity(
            destinationBefore?.quantity ?? "0",
            localeTag,
          ),
          quantityIn: formatQuantity(preview.quantityIn, localeTag),
          quantityOrigin: formatQuantity(
            originPosition?.quantity ?? "0",
            localeTag,
          ),
          raw: formatQuantity(preview.raw, localeTag),
          realizedOut: money(preview.realizedOut),
        }
      : undefined,
    ratioFrom: state.ratioFrom,
    ratioTo: state.ratioTo,
    referenceValue,
    suggestions,
    ticker: state.ticker,
  };
}
