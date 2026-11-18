import { useState } from "react";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateStockItemUseCaseParams } from "@application/useCases/cases/stock/createStockItemUseCase";
import { UpdateStockItemUseCaseParams } from "@application/useCases/cases/stock/updateStockItemUseCase";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import {
  initialInput,
  QuantityInput,
  QuantityMode,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export type StockFormErrors = Partial<
  Record<
    | "description"
    | "ideal"
    | "quantity"
    | "shelfLife"
    | "warnClosed"
    | "warnOpened",
    TranslationKeys
  >
>;

export interface StockFormValues {
  barcode: string;
  brand: string;
  categoryId?: string;
  description: string;
  expirationDate?: Date;
  ideal: QuantityInput;
  locationId?: string;
  min: QuantityInput;
  notes: string;
  openedShelfLifeDays: string;
  ownerId?: string;
  purchaseDate?: Date;
  quantity: QuantityInput;
  stockOnly: boolean;
  unit: StockUnits;
  warnDaysClosed: string;
  warnDaysOpened: string;
}

const EMPTY: QuantityInput = { mode: QuantityMode.SMALL, text: "" };

const INITIAL_VALUES: StockFormValues = {
  barcode: "",
  brand: "",
  description: "",
  ideal: EMPTY,
  min: EMPTY,
  notes: "",
  openedShelfLifeDays: "",
  quantity: EMPTY,
  stockOnly: false,
  unit: StockUnits.UNIT,
  warnDaysClosed: "7",
  warnDaysOpened: "1",
};

const FIELDS = Object.keys(INITIAL_VALUES).concat([
  "categoryId",
  "expirationDate",
  "locationId",
  "ownerId",
  "purchaseDate",
]) as Array<keyof StockFormValues>;

export function buildCreateParams(
  values: StockFormValues,
  owners: OwnerDTO[],
  defaultOwnerId: string,
): CreateStockItemUseCaseParams {
  const ownerId = values.ownerId ?? defaultOwnerId;

  return {
    barcode: optional(values.barcode),
    brand: optional(values.brand),
    categoryId: values.categoryId,
    description: values.description.trim(),
    expirationDate: values.expirationDate,
    idealQuantity: values.stockOnly
      ? undefined
      : toQuantity(values.ideal, values.unit),
    locationId: values.locationId,
    minQuantity: values.stockOnly
      ? undefined
      : toQuantity(values.min, values.unit),
    notes: optional(values.notes),
    openedShelfLifeDays: optionalInt(values.openedShelfLifeDays),
    owner: ownerOf(ownerId, owners),
    ownerId,
    purchaseDate: values.purchaseDate,
    quantity: toQuantity(values.quantity, values.unit) ?? 0,
    stockOnly: values.stockOnly,
    unit: values.unit,
    warnDaysClosed: parseInt(values.warnDaysClosed, 10),
    warnDaysOpened: parseInt(values.warnDaysOpened, 10),
  };
}

// Edit: every editable field travels, `null` clears an optional one; the owner only WHEN it changed.
export function buildUpdateParams(
  values: StockFormValues,
  item: StockDTO,
  owners: OwnerDTO[],
): UpdateStockItemUseCaseParams {
  const ownerId = values.ownerId ?? item.ownerId;
  const moved = ownerId !== item.ownerId;
  const min = toQuantity(values.min, values.unit);
  const ideal = toQuantity(values.ideal, values.unit);

  return {
    barcode: optional(values.barcode) ?? null,
    brand: optional(values.brand) ?? null,
    // After an owner change the API replaces them by the same-name ones (or clears), unless the form picked one.
    categoryId:
      moved && values.categoryId === item.categoryId
        ? undefined
        : (values.categoryId ?? null),
    description: values.description.trim(),
    id: item.id,
    idealQuantity: values.stockOnly ? undefined : (ideal ?? null),
    locationId:
      moved && values.locationId === item.locationId
        ? undefined
        : (values.locationId ?? null),
    minQuantity: values.stockOnly ? undefined : (min ?? null),
    notes: optional(values.notes) ?? null,
    openedShelfLifeDays: optionalInt(values.openedShelfLifeDays) ?? null,
    owner: moved ? ownerOf(ownerId, owners) : undefined,
    ownerId: moved ? ownerId : undefined,
    previousOwnerId: item.ownerId,
    stockOnly: values.stockOnly,
    unit: values.unit === item.unit ? undefined : values.unit,
    warnDaysClosed: parseInt(values.warnDaysClosed, 10),
    warnDaysOpened: parseInt(values.warnDaysOpened, 10),
  };
}

export function validateStockForm(
  values: StockFormValues,
  options: { isEdit: boolean },
): StockFormErrors {
  const errors: StockFormErrors = {};
  const min = toQuantity(values.min, values.unit);
  const ideal = toQuantity(values.ideal, values.unit);

  if (!values.description.trim()) {
    errors.description = "stock.form.descriptionRequired";
  }

  // An empty quantity creates the item with no lot; a typed one must fit the unit.
  if (
    !options.isEdit &&
    values.quantity.text.trim() !== "" &&
    toQuantity(values.quantity, values.unit) === undefined
  ) {
    errors.quantity = "stock.form.quantityInvalid";
  }

  if (min !== undefined && ideal !== undefined && ideal <= min) {
    errors.ideal = "stock.form.idealRule";
  }

  if (
    values.openedShelfLifeDays.trim() !== "" &&
    !inRange(values.openedShelfLifeDays, 1, 3650)
  ) {
    errors.shelfLife = "stock.form.shelfLifeInvalid";
  }

  if (!inRange(values.warnDaysClosed, 0, 365)) {
    errors.warnClosed = "stock.form.warnDaysInvalid";
  }

  if (!inRange(values.warnDaysOpened, 0, 365)) {
    errors.warnOpened = "stock.form.warnDaysInvalid";
  }

  return errors;
}

// The editable values of a stored item (edit mode): the quantity stays with the lots.
export function valuesFromItem(item: StockDTO): StockFormValues {
  return {
    barcode: item.barcode ?? "",
    brand: item.brand ?? "",
    categoryId: item.categoryId,
    description: item.description,
    ideal: initialInput(item.idealQuantity, item.unit),
    locationId: item.locationId,
    min: initialInput(item.minQuantity, item.unit),
    notes: item.notes ?? "",
    openedShelfLifeDays:
      item.openedShelfLifeDays === undefined
        ? ""
        : String(item.openedShelfLifeDays),
    ownerId: item.ownerId,
    quantity: EMPTY,
    stockOnly: item.stockOnly,
    unit: item.unit,
    warnDaysClosed: String(item.warnDaysClosed),
    warnDaysOpened: String(item.warnDaysOpened),
  };
}

function inRange(value: string, min: number, max: number) {
  return /^\d+$/.test(value.trim()) && +value >= min && +value <= max;
}

function isSame(a: unknown, b: unknown) {
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }

  if (typeof a === "object" && typeof b === "object" && a && b) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  return a === b;
}

function optional(value: string) {
  return value.trim() || undefined;
}

function optionalInt(value: string) {
  return value.trim() === "" ? undefined : parseInt(value, 10);
}

function ownerOf(ownerId: string, owners: OwnerDTO[]) {
  return owners.find((item) => item.id === ownerId)?.type === OwnerType.FAMILY
    ? StockOwners.FAMILY
    : StockOwners.USER;
}

function useForm(
  defaultOwnerId: string | undefined,
  stored: StockFormValues | undefined,
) {
  const [state, setState] = useState<StockFormValues | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const isEdit = stored !== undefined;

  const initial: StockFormValues = {
    ...(stored ?? INITIAL_VALUES),
    ownerId: stored?.ownerId ?? defaultOwnerId,
  };
  const values: StockFormValues = {
    ...(state ?? initial),
    ownerId: (state ?? initial).ownerId ?? defaultOwnerId,
  };
  const isDirty = FIELDS.some((key) => !isSame(values[key], initial[key]));
  const errors: StockFormErrors = submitted
    ? validateStockForm(values, { isEdit })
    : {};

  function setField<K extends keyof StockFormValues>(
    key: K,
    value: StockFormValues[K],
  ) {
    setState((current) => ({ ...(current ?? initial), [key]: value }));
  }

  function isValid() {
    setSubmitted(true);

    return Object.keys(validateStockForm(values, { isEdit })).length === 0;
  }

  return { errors, isDirty, isValid, setField, values };
}

export default useForm;
