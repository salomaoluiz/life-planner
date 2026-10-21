import { DateFormat, DecimalSeparator } from "./types";

const MAX_CENTS = 2147483647;
const MIN_DATE = "1900-01-01";
const MAX_DATE = "2100-12-31";

interface ParsedAmount {
  cents: number;
  negative: boolean;
}

function dateFields(
  [first, second, third]: string[],
  format: DateFormat,
): { day: string; month: string; year: string } {
  if (format === "yyyy-mm-dd") {
    return { day: third, month: second, year: first };
  }

  if (format === "mm/dd/yyyy") {
    return { day: second, month: first, year: third };
  }

  return { day: first, month: second, year: third };
}

// Two digits: 00-69 → 2000s, 70-99 → 1900s. Three digits are not a year.
function fullYear(text: string): number | undefined {
  if (text.length === 3) {
    return undefined;
  }

  const year = Number(text);

  if (text.length === 4) {
    return year;
  }

  return year < 70 ? 2000 + year : 1900 + year;
}

// "R$ 1.234,56", "(45,00)", "-12.5", "1,234.56": currency symbols and thousands separators are stripped, parentheses
// and a leading or trailing minus mean negative. Zero, empty, more than 2 decimals or text → undefined (FR 27).
function parseAmountCents(
  raw: string,
  decimal: DecimalSeparator,
): ParsedAmount | undefined {
  const text = raw.trim();
  const negative =
    /^[-−]/.test(text) || /[-−]$/.test(text) || /^\(.*\)$/.test(text);
  const digits = text.replace(/[^\d.,]/g, "");
  const normalized =
    decimal === ","
      ? digits.replace(/\./g, "").replace(",", ".")
      : digits.replace(/,/g, "");

  if (!/^\d+(\.\d{1,2})?$|^\.\d{1,2}$/.test(normalized)) {
    return undefined;
  }

  const [whole, fraction = ""] = normalized.split(".");
  const cents = Number(whole || "0") * 100 + Number(fraction.padEnd(2, "0"));

  if (cents <= 0 || cents > MAX_CENTS) {
    return undefined;
  }

  return { cents, negative };
}

// `ISO` date of a cell, or undefined for an impossible day (31/09/2026) or a year outside 1900-2100.
function parseDate(raw: string, format: DateFormat): string | undefined {
  const parts = /^(\d{1,4})[./-](\d{1,2})[./-](\d{1,4})$/.exec(raw.trim());

  if (!parts) {
    return undefined;
  }

  const fields = dateFields([parts[1], parts[2], parts[3]], format);
  const year = fullYear(fields.year);

  if (year === undefined) {
    return undefined;
  }

  const iso = `${String(year).padStart(4, "0")}-${fields.month.padStart(2, "0")}-${fields.day.padStart(2, "0")}`;
  const date = new Date(`${iso}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== iso) {
    return undefined;
  }

  return iso < MIN_DATE || iso > MAX_DATE ? undefined : iso;
}

export type { ParsedAmount };
export { parseAmountCents, parseDate };
