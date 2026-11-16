import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { parseDecimal, ZERO } from "@utils/decimal";

export interface ConversionFormErrors {
  account: boolean;
  date: "future" | undefined;
  destination: boolean;
  name: boolean;
  ratioFrom: boolean;
  ratioTo: boolean;
  referenceValue: boolean;
  ticker: boolean;
}

// What the owner types (spec 112 section 8); the strings stay as typed until they are sent.
export interface ConversionFormState {
  accountId: string;
  // Cents of the cash part; 0 = no cash part.
  cashAmount: number;
  date: Date;
  destinationId: string;
  mode: DestinationMode;
  name: string;
  ratioFrom: string;
  ratioTo: string;
  referenceValue: string;
  ticker: string;
}

export type DestinationMode = "existing" | "new";

// Spec 112 section 8: the picker lists only active assets of the same owner, class and currency, never the origin.
export function eligibleDestinations(
  origin: Pick<
    InvestmentAsset,
    "assetClass" | "currency" | "id" | "owner" | "ownerId"
  >,
  assets: InvestmentAsset[],
): InvestmentAsset[] {
  return assets
    .filter(
      (asset) =>
        asset.id !== origin.id &&
        asset.status === "ACTIVE" &&
        asset.assetClass === origin.assetClass &&
        asset.currency === origin.currency &&
        asset.owner === origin.owner &&
        asset.ownerId === origin.ownerId,
    )
    .sort((a, b) => (a.ticker ?? a.name).localeCompare(b.ticker ?? b.name));
}

export function hasErrors(errors: ConversionFormErrors): boolean {
  return (
    errors.account ||
    errors.date !== undefined ||
    errors.destination ||
    errors.name ||
    errors.ratioFrom ||
    errors.ratioTo ||
    errors.referenceValue ||
    errors.ticker
  );
}

export function toDay(date: Date): string {
  return todayCalendarDate(date);
}

export function validateConversion(
  state: ConversionFormState,
  editing: boolean,
): ConversionFormErrors {
  const hasCash = state.cashAmount > 0;
  const creating = !editing && state.mode === "new";

  return {
    account: hasCash && !state.accountId,
    date: toDay(state.date) > toDay(new Date()) ? "future" : undefined,
    destination: !editing && state.mode === "existing" && !state.destinationId,
    name: creating && state.name.trim() === "",
    ratioFrom: !isPositive(state.ratioFrom),
    ratioTo: !isPositive(state.ratioTo),
    referenceValue: hasCash && !isPositive(state.referenceValue),
    ticker: creating && state.ticker.trim() === "",
  };
}

function isPositive(value: string): boolean {
  const parsed = parseDecimal(value);

  return parsed !== null && parsed > ZERO;
}
