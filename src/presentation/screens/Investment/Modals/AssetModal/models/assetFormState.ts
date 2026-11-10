import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import {
  InvestmentAssetClass,
  TICKER_REQUIRED_CLASSES,
} from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import {
  CreateInvestmentAssetParams,
  UpdateInvestmentAssetParams,
} from "@domain/repositories/investment";
import { TranslationKeys } from "@presentation/i18n/types";
import { parseDecimal, ZERO } from "@utils/decimal";

const MAX_NAME = 100;
const MAX_TICKER = 20;
const TICKER_TEXT = /^[A-Z0-9.-]*$/;

type AssetFormErrors = Partial<
  Record<"currentValue" | "name" | "ticker", TranslationKeys>
>;

interface AssetFormState {
  assetClass: InvestmentAssetClass;
  currency: CurrencyCode;
  // The user typed the currency: the class stops suggesting one.
  currencyTouched: boolean;
  // Create only: optional first value per unit (decimal text).
  currentValue: string;
  name: string;
  // The user typed the name: the ticker stops filling it.
  nameTouched: boolean;
  ownerId: string;
  ticker: string;
}

function createInitialState(params: { ownerId: string }): AssetFormState {
  return {
    assetClass: InvestmentAssetClass.BR_STOCK,
    currency: DEFAULT_CURRENCY,
    currencyTouched: false,
    currentValue: "",
    name: "",
    nameTouched: false,
    ownerId: params.ownerId,
    ticker: "",
  };
}

function isSameState(a: AssetFormState, b: AssetFormState) {
  return (
    a.assetClass === b.assetClass &&
    a.currency === b.currency &&
    a.currentValue === b.currentValue &&
    a.name === b.name &&
    a.ownerId === b.ownerId &&
    a.ticker === b.ticker
  );
}

function stateFromAsset(asset: InvestmentAsset): AssetFormState {
  return {
    assetClass: asset.assetClass,
    currency: asset.currency,
    currencyTouched: true,
    currentValue: "",
    name: asset.name,
    nameTouched: true,
    ownerId: asset.ownerId,
    ticker: asset.ticker ?? "",
  };
}

function tickerRequired(assetClass: InvestmentAssetClass): boolean {
  return TICKER_REQUIRED_CLASSES.includes(assetClass);
}

function toCreateParams(
  state: AssetFormState,
  owner: OwnerType,
): CreateInvestmentAssetParams {
  return {
    assetClass: state.assetClass,
    currency: state.currency,
    currentUnitPrice: state.currentValue.trim() || undefined,
    name: state.name.trim(),
    owner,
    ownerId: state.ownerId,
    ticker: state.ticker.trim() || undefined,
  };
}

// Only what changed goes to the API; the owner pair always travels together.
function toUpdateParams(
  id: string,
  state: AssetFormState,
  initial: AssetFormState,
  owner: OwnerType,
): UpdateInvestmentAssetParams {
  const changes: UpdateInvestmentAssetParams = { id };

  if (state.assetClass !== initial.assetClass) {
    changes.assetClass = state.assetClass;
  }
  if (state.currency !== initial.currency) {
    changes.currency = state.currency;
  }
  if (state.name.trim() !== initial.name) {
    changes.name = state.name.trim();
  }
  if (state.ownerId !== initial.ownerId) {
    changes.owner = owner;
    changes.ownerId = state.ownerId;
  }
  if (state.ticker !== initial.ticker) {
    changes.ticker = state.ticker.trim() === "" ? null : state.ticker.trim();
  }

  return changes;
}

function validate(state: AssetFormState): AssetFormErrors {
  const errors: AssetFormErrors = {};

  if (state.name.trim() === "" || state.name.trim().length > MAX_NAME) {
    errors.name = "investment.form.asset.nameRequired";
  }
  if (
    (tickerRequired(state.assetClass) && state.ticker.trim() === "") ||
    !TICKER_TEXT.test(state.ticker)
  ) {
    errors.ticker = "investment.form.asset.tickerRequired";
  }
  if (state.currentValue.trim() !== "") {
    const value = parseDecimal(state.currentValue);

    if (value === null || value <= ZERO) {
      errors.currentValue = "investment.form.operation.unitPriceInvalid";
    }
  }

  return errors;
}

// Picking the class suggests the currency (foreign stock -> USD) until the user chose one.
function withAssetClass(
  state: AssetFormState,
  assetClass: InvestmentAssetClass,
): AssetFormState {
  const suggested =
    assetClass === InvestmentAssetClass.FOREIGN_STOCK
      ? "USD"
      : DEFAULT_CURRENCY;

  return {
    ...state,
    assetClass,
    currency: state.currencyTouched ? state.currency : suggested,
  };
}

function withCurrency(
  state: AssetFormState,
  currency: CurrencyCode,
): AssetFormState {
  return { ...state, currency, currencyTouched: true };
}

function withName(state: AssetFormState, name: string): AssetFormState {
  return { ...state, name, nameTouched: true };
}

// The ticker is upper-cased as typed; it pre-fills the name until the name was typed.
function withTicker(state: AssetFormState, ticker: string): AssetFormState {
  const next = ticker.toUpperCase().slice(0, MAX_TICKER);

  return {
    ...state,
    name: state.nameTouched ? state.name : next,
    ticker: next,
  };
}

export type { AssetFormErrors, AssetFormState };
export {
  createInitialState,
  isSameState,
  stateFromAsset,
  tickerRequired,
  toCreateParams,
  toUpdateParams,
  validate,
  withAssetClass,
  withCurrency,
  withName,
  withTicker,
};
