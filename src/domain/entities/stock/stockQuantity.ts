import { StockUnits } from "@domain/entities/stock/StockEntity";

// Spec 116 FR 3: quantities of kg/L items are typed and shown in g/ml below 1 and in kg/L from 1 up. The API always
// carries the item unit (1.5 = 1,5 kg).
export enum QuantityMode {
  LARGE = "LARGE",
  SMALL = "SMALL",
}

export type QuantityUnitKey =
  | "gram"
  | "kilogram"
  | "liter"
  | "milliliter"
  | "unit";

const MILLI = 1000;

export interface QuantityInput {
  mode: QuantityMode;
  // What the field shows, in the unit of `mode`.
  text: string;
}

// One keystroke on the field: refuses characters the unit does not take, switches g -> kg at 1000 and kg -> g below 1.
export function applyInput(
  previous: QuantityInput,
  typed: string,
  unit: StockUnits,
): QuantityInput {
  if (unit === StockUnits.UNIT || previous.mode === QuantityMode.SMALL) {
    if (!/^\d*$/.test(typed)) {
      return previous;
    }

    const value = typed === "" ? 0 : Number(typed);

    return unit !== StockUnits.UNIT && value >= MILLI
      ? { mode: QuantityMode.LARGE, text: decimalText(value / MILLI) }
      : { mode: previous.mode, text: typed };
  }

  // kg/L mode: up to 3 decimals, comma or dot.
  if (!/^\d*([.,]\d{0,3})?$/.test(typed)) {
    return previous;
  }

  const value = parseNumber(typed);

  if (
    value !== undefined &&
    value > 0 &&
    value < 1 &&
    !/[.,]$/.test(typed) &&
    typed.replace(/\D/g, "") !== ""
  ) {
    return {
      mode: QuantityMode.SMALL,
      text: String(Math.round(value * MILLI)),
    };
  }

  return { mode: QuantityMode.LARGE, text: typed };
}

export function formatAmount(amount: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 3 }).format(
    amount,
  );
}

export function initialInput(
  quantity: number | undefined,
  unit: StockUnits,
): QuantityInput {
  if (quantity === undefined) {
    return { mode: QuantityMode.SMALL, text: "" };
  }

  if (unit === StockUnits.UNIT) {
    return { mode: QuantityMode.SMALL, text: String(quantity) };
  }

  return quantity >= 1
    ? { mode: QuantityMode.LARGE, text: decimalText(quantity) }
    : {
        mode: QuantityMode.SMALL,
        text: String(Math.round(quantity * MILLI)),
      };
}

export function isBulk(unit: StockUnits): boolean {
  return unit !== StockUnits.UNIT;
}

export function roundQuantity(value: number): number {
  return Math.round(value * MILLI) / MILLI;
}

// "500 g", "1,5 kg", "3 un": the amount and the unit key the screen translates.
export function toDisplay(
  quantity: number,
  unit: StockUnits,
): { amount: number; unitKey: QuantityUnitKey } {
  if (unit === StockUnits.UNIT) {
    return { amount: quantity, unitKey: "unit" };
  }

  const isKilogram = unit === StockUnits.KILOGRAM;

  if (Math.abs(quantity) < 1) {
    return {
      amount: Math.round(quantity * MILLI),
      unitKey: isKilogram ? "gram" : "milliliter",
    };
  }

  return {
    amount: roundQuantity(quantity),
    unitKey: isKilogram ? "kilogram" : "liter",
  };
}

// The quantity in the item unit (what the API takes), or `undefined` while the field is empty or invalid.
export function toQuantity(
  input: QuantityInput,
  unit: StockUnits,
): number | undefined {
  const value = parseNumber(input.text);

  if (value === undefined) {
    return undefined;
  }

  if (unit === StockUnits.UNIT) {
    return Number.isInteger(value) ? value : undefined;
  }

  return roundQuantity(
    input.mode === QuantityMode.SMALL ? value / MILLI : value,
  );
}

function decimalText(value: number): string {
  return String(roundQuantity(value)).replace(".", ",");
}

function parseNumber(text: string): number | undefined {
  const normalized = text.replace(",", ".");

  return /^\d+(\.\d*)?$/.test(normalized) ? Number(normalized) : undefined;
}
