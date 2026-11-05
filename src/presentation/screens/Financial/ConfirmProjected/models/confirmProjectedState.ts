import { invoiceMonthOf } from "@screens/Financial/models/invoiceMonth";

// Cents as the decimal text the data layer takes ("99.90").
function centsToDecimal(cents: number) {
  return (cents / 100).toFixed(2);
}

// The invoice a charge dated `date` lands on, by the closing day of the card.
function chargedInvoiceMonth(date: Date, closingDay: number) {
  const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  return invoiceMonthOf(iso, closingDay);
}

// What was charged minus what was projected (cents).
function differenceCents(chargedCents: number, projectedCents: number) {
  return chargedCents - projectedCents;
}

function isValidCharge(chargedCents: number) {
  return chargedCents > 0;
}

export { centsToDecimal, chargedInvoiceMonth, differenceCents, isValidCharge };
