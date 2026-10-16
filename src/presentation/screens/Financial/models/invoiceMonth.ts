// The billing rules of 026 FR 12-17, mirrored from the API so the form can preview where a
// purchase lands. Pure calendar math on `YYYY-MM-DD` strings (no time zones).
interface YearMonth {
  month: number; // 1-12
  year: number;
}

function addMonths(reference: YearMonth, delta: number): YearMonth {
  const index = reference.year * 12 + (reference.month - 1) + delta;

  return { month: (index % 12) + 1, year: Math.floor(index / 12) };
}

// "2026-10" + 3 -> "2027-01".
function addMonthsTo(month: string, delta: number): string {
  return formatMonth(addMonths(parseMonth(month), delta));
}

// Due day of the invoice of `referenceMonth`: in that month when after the closing day, else the next.
function dueDateOf(
  referenceMonth: string,
  closingDay: number,
  dueDay: number,
): string {
  const reference = parseMonth(referenceMonth);
  const target = dueDay > closingDay ? reference : addMonths(reference, 1);

  return toDate(target, effectiveDay(dueDay, target));
}

function effectiveDay(day: number, reference: YearMonth) {
  return Math.min(day, new Date(reference.year, reference.month, 0).getDate());
}

function formatMonth(reference: YearMonth) {
  return `${String(reference.year).padStart(4, "0")}-${String(reference.month).padStart(2, "0")}`;
}

// "2026-10-31" -> "2026-10"; the day after the closing day opens the next invoice.
function invoiceMonthOf(date: string, closingDay: number): string {
  const current = parseMonth(date.slice(0, 7));
  const closing = toDate(current, effectiveDay(closingDay, current));

  return formatMonth(date <= closing ? current : addMonths(current, 1));
}

function parseMonth(month: string): YearMonth {
  const [year, value] = month.split("-").map(Number);

  return { month: value, year };
}

function toDate(reference: YearMonth, day: number) {
  return `${formatMonth(reference)}-${String(day).padStart(2, "0")}`;
}

export { addMonthsTo, dueDateOf, invoiceMonthOf };
