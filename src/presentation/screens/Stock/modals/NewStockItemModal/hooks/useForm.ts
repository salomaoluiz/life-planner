import { useState } from "react";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateStockItemUseCaseParams } from "@application/useCases/cases/stock/createStockItemUseCase";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { TranslationKeys } from "@presentation/i18n/types";

export type StockFormErrors = Partial<
  Record<"description" | "quantity", TranslationKeys>
>;

export interface StockFormValues {
  barcode: string;
  brand: string;
  description: string;
  expirationDate?: Date;
  notes: string;
  openingDate?: Date;
  ownerId?: string;
  purchaseDate?: Date;
  quantity: string;
  unit: StockUnits;
}

const INITIAL_VALUES: StockFormValues = {
  barcode: "",
  brand: "",
  description: "",
  notes: "",
  quantity: "1",
  unit: StockUnits.UNIT,
};

const FIELDS: Array<keyof StockFormValues> = [
  ...(Object.keys(INITIAL_VALUES) as Array<keyof StockFormValues>),
  "expirationDate",
  "openingDate",
  "ownerId",
  "purchaseDate",
];

export function buildStockParams(
  values: StockFormValues,
  owners: OwnerDTO[],
  defaultOwnerId: string,
): CreateStockItemUseCaseParams {
  const ownerId = values.ownerId ?? defaultOwnerId;
  const owner = owners.find((item) => item.id === ownerId);

  return {
    barcode: optional(values.barcode),
    brand: optional(values.brand),
    description: values.description.trim(),
    expirationDate: values.expirationDate,
    notes: optional(values.notes),
    openingDate: values.openingDate,
    owner:
      owner?.type === OwnerType.FAMILY ? StockOwners.FAMILY : StockOwners.USER,
    ownerId,
    purchaseDate: values.purchaseDate,
    quantity: parseInt(values.quantity, 10),
    unit: values.unit,
  };
}

export function validateStockForm(values: StockFormValues): StockFormErrors {
  const errors: StockFormErrors = {};
  const quantity = values.quantity.trim();

  if (!values.description.trim()) {
    errors.description = "stock.form.descriptionRequired";
  }

  if (!/^\d+$/.test(quantity) || parseInt(quantity, 10) < 1) {
    errors.quantity = "stock.form.quantityRequired";
  }

  return errors;
}

function isSame(a: unknown, b: unknown) {
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }

  return a === b;
}

function optional(value: string) {
  return value.trim() || undefined;
}

function useForm(defaultOwnerId: string | undefined) {
  const [state, setState] = useState<StockFormValues>(INITIAL_VALUES);
  const [submitted, setSubmitted] = useState(false);

  const values: StockFormValues = {
    ...state,
    ownerId: state.ownerId ?? defaultOwnerId,
  };
  const initial: StockFormValues = {
    ...INITIAL_VALUES,
    ownerId: defaultOwnerId,
  };
  const isDirty = FIELDS.some((key) => !isSame(values[key], initial[key]));
  const errors: StockFormErrors = submitted ? validateStockForm(values) : {};

  function setField<K extends keyof StockFormValues>(
    key: K,
    value: StockFormValues[K],
  ) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function submit(owners: OwnerDTO[]) {
    setSubmitted(true);

    if (Object.keys(validateStockForm(values)).length) {
      return undefined;
    }

    return buildStockParams(values, owners, defaultOwnerId ?? "");
  }

  return { errors, isDirty, setField, submit, values };
}

export default useForm;
