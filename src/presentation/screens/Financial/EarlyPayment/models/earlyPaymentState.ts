import { TranslationKeys } from "@presentation/i18n/types";
import { AssignableInvoice } from "@screens/Financial/models/creditSheet";

interface EarlyPaymentErrors {
  account?: TranslationKeys;
  amount?: TranslationKeys;
  date?: TranslationKeys;
  description?: TranslationKeys;
}

interface EarlyPaymentFields {
  accountId?: string;
  amountCents: number;
  date: Date;
  method: PayMethod;
}

type PayMethod = "ACCOUNT" | "EXTERNAL";

// What can still be paid: the invoice's amount due, plus this payment's own value while it is being edited (spec 032 FR 30, 34).
function leftToPay(
  target: AssignableInvoice | undefined,
  ownValueCents: number,
  isSameInvoice: boolean,
) {
  return (target?.amountDueCents ?? 0) + (isSameInvoice ? ownValueCents : 0);
}

function validate(
  fields: EarlyPaymentFields,
  description: string,
  leftCents: number,
  todayStart: Date,
): EarlyPaymentErrors {
  const errors: EarlyPaymentErrors = {};

  if (fields.amountCents < 1) {
    errors.amount = "financial.earlyPayment.errors.amount";
  } else if (fields.amountCents > leftCents) {
    errors.amount = "financial.errors.overAmountDue";
  }

  if (description.trim().length === 0) {
    errors.description = "financial.earlyPayment.errors.description";
  }

  if (fields.method === "ACCOUNT" && !fields.accountId) {
    errors.account = "financial.earlyPayment.errors.account";
  }

  if (fields.date.getTime() > todayStart.getTime()) {
    errors.date = "financial.earlyPayment.errors.date";
  }

  return errors;
}

export type { EarlyPaymentErrors, EarlyPaymentFields, PayMethod };
export { leftToPay, validate };
