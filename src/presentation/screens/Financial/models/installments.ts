import { addMonthsTo } from "./invoiceMonth";

export const MAX_INSTALLMENTS = 48;
export const MIN_INSTALLMENTS = 2;

interface InstallmentLabel {
  count: number;
  number: number;
}

// "2026-10" + 10 installments -> first "2026-10", last "2027-07".
function installmentInvoiceRange(firstMonth: string, count: number) {
  return {
    first: firstMonth,
    last: addMonthsTo(firstMonth, count - 1),
  };
}

// First installment = base + remainder; the others = base (same split as the API).
function installmentPreview(totalCents: number, count: number) {
  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count;

  return { first: base + remainder, hasRemainder: remainder > 0, others: base };
}

// "Notebook 3/10" for an installment, the plain description otherwise (spec 030 FR 8).
function installmentTitle(
  description: string,
  installment: InstallmentLabel | undefined,
  format: (params: { description: string; k: number; n: number }) => string,
) {
  return installment
    ? format({
        description,
        k: installment.number,
        n: installment.count,
      })
    : description;
}

function isValidInstallmentCount(count: number) {
  return (
    Number.isInteger(count) &&
    count >= MIN_INSTALLMENTS &&
    count <= MAX_INSTALLMENTS
  );
}

function splitInstallmentCents(totalCents: number, count: number): number[] {
  const { first, others } = installmentPreview(totalCents, count);

  return Array.from({ length: count }, (_, index) =>
    index === 0 ? first : others,
  );
}

export type { InstallmentLabel };
export {
  installmentInvoiceRange,
  installmentPreview,
  installmentTitle,
  isValidInstallmentCount,
  splitInstallmentCents,
};
