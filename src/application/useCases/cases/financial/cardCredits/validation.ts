import { FieldInvalid } from "@domain/entities/errors";

const CALENDAR_DATE = /^\d{4}-\d{2}-\d{2}$/;
const INVOICE_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

// Fails BEFORE any network call (the API repeats the rules).
function assertCredit(fields: {
  date?: string;
  description?: string;
  invoiceMonth?: string;
  value?: number;
}) {
  if (fields.date !== undefined && !CALENDAR_DATE.test(fields.date)) {
    throw new FieldInvalid({ date: fields.date });
  }

  if (
    fields.description !== undefined &&
    (fields.description.trim().length === 0 || fields.description.length > 200)
  ) {
    throw new FieldInvalid({ description: fields.description });
  }

  if (
    fields.invoiceMonth !== undefined &&
    !INVOICE_MONTH.test(fields.invoiceMonth)
  ) {
    throw new FieldInvalid({ invoiceMonth: fields.invoiceMonth });
  }

  if (
    fields.value !== undefined &&
    (!Number.isInteger(fields.value) || fields.value < 1)
  ) {
    throw new FieldInvalid({ value: fields.value });
  }
}

export { assertCredit };
