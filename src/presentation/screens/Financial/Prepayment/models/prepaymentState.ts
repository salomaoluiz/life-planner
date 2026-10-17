import { EligibleInstallmentEntity } from "@domain/entities/financial/PrepaymentPreviewEntity";
import { TranslationKeys } from "@presentation/i18n/types";

interface PrepaymentErrors {
  discount?: TranslationKeys;
}

// The invoice total after the move: its current total plus what moves into it, minus the discount (cents).
function resultingTotal(
  invoiceTotalCents: number,
  movedCents: number,
  discountCents: number,
) {
  return invoiceTotalCents + movedCents - discountCents;
}

// What the form needs to describe the installments that move: "7 installments (4/10 to 10/10)".
function summaryOf(eligible: EligibleInstallmentEntity[], count: number) {
  const numbers = eligible.map((row) => row.installmentNumber);

  return {
    count: eligible.length,
    first: `${Math.min(...numbers)}/${count}`,
    last: `${Math.max(...numbers)}/${count}`,
  };
}

// A discount, when asked for, is at least one cent and at most what moves (spec 032 FR 14).
function validate(
  state: { discountCents: number; hasDiscount: boolean },
  movedCents: number,
): PrepaymentErrors {
  if (
    state.hasDiscount &&
    (state.discountCents < 1 || state.discountCents > movedCents)
  ) {
    return { discount: "financial.prepayment.errors.discount" };
  }

  return {};
}

export type { PrepaymentErrors };
export { resultingTotal, summaryOf, validate };
