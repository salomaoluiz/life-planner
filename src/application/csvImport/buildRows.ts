import { creditKeyOf, isPaymentCategory } from "./cardCredits";
import { isSystemCategoryName } from "./distinctValues";
import { columnsOf } from "./mapping";
import { accountKey, categoryKey, ownerOfRow } from "./owner";
import { parseAmountCents, parseDate, parseInvoiceMonth } from "./parseValues";
import {
  ColumnMapping,
  ColumnTarget,
  DateFormat,
  DecimalSeparator,
  FixedValues,
  ImportRowPayload,
  RowType,
  ValueMaps,
} from "./types";

interface BuildInput {
  dateFormat: DateFormat;
  decimal: DecimalSeparator;
  // The owner of the rows without a "Belongs to" value (step 1), and the type of every owner.
  defaultOwnerId: string;
  fixed: FixedValues;
  mapping: ColumnMapping;
  ownerTypes: Record<string, "FAMILY" | "USER">;
  // The data rows, without the header line.
  rows: string[][];
  valueMaps: ValueMaps;
}

interface BuildResult {
  // FR 28: rows whose category is one the app creates itself.
  ignoredSystemRows: number;
  rows: BuiltRow[];
}

interface BuiltRow {
  // The cells shown in the review table whatever the outcome.
  display: { amount: string; date: string; description: string };
  // Set when the row cannot be sent as is.
  error?: LocalRowErrorCode;
  // File line of the row (the header is line 1).
  line: number;
  payload?: ImportRowPayload;
}

type CellReader = (row: string[], target: ColumnTarget) => string;

// Row problems the app finds itself, before asking the server (FR 27).
type LocalRowErrorCode =
  | "ACCOUNT_OR_CARD_MISSING"
  | "AMOUNT_BOTH_OR_NONE"
  | "CATEGORY_MISSING"
  | "INVALID_DATE"
  | "INVALID_VALUE"
  | "INVOICE_MONTH_INVALID"
  | "TYPE_MISSING";

// A column value wins; the fixed account or card covers the rows the columns leave empty (FR 18, 19).
function accountOrCardOf(
  input: BuildInput,
  ownerId: string,
  accountText: string,
  cardText: string,
): undefined | { accountId?: string; creditCardId?: string } {
  const accountId = input.valueMaps.account[accountKey(ownerId, accountText)];
  const creditCardId = input.valueMaps.card[accountKey(ownerId, cardText)];

  if (accountId !== undefined || creditCardId !== undefined) {
    return { accountId, creditCardId };
  }

  const { accountOrCard } = input.fixed;

  if (!accountOrCard) {
    return undefined;
  }

  return accountOrCard.kind === "account"
    ? { accountId: accountOrCard.id }
    : { creditCardId: accountOrCard.id };
}

function amountText(
  input: BuildInput,
  cell: CellReader,
  row: string[],
): string {
  return (
    cell(row, "signedAmount") ||
    cell(row, "amount") ||
    cell(row, "incomeAmount") ||
    cell(row, "expenseAmount")
  );
}

function buildRow(
  input: BuildInput,
  row: string[],
  line: number,
  cell: CellReader,
): "IGNORED" | BuiltRow {
  const dateText = cell(row, "date");
  const description = cell(row, "description");
  const display = {
    amount: amountText(input, cell, row),
    date: dateText,
    description,
  };
  const date = parseDate(dateText, input.dateFormat);

  if (date === undefined) {
    return { display, error: "INVALID_DATE", line };
  }

  const amount = readAmount(input, cell, row);

  if ("error" in amount) {
    return { display, error: amount.error, line };
  }

  const ownerId = ownerOfRow(
    row,
    input.mapping,
    input.valueMaps.owner,
    input.defaultOwnerId,
  );
  const categoryId = categoryOf(
    input,
    ownerId,
    cell(row, "category"),
    amount.type,
  );

  if (categoryId === undefined) {
    return { display, error: "CATEGORY_MISSING", line };
  }

  const target = accountOrCardOf(
    input,
    ownerId,
    cell(row, "account"),
    cell(row, "card"),
  );

  if (target === undefined) {
    return { display, error: "ACCOUNT_OR_CARD_MISSING", line };
  }

  // Spec 048 FR 4: an invoice payment on an account without a card is a debit row of an app export; its card row
  // carries the data.
  if (
    creditKeyOf(categoryId) === "INVOICE_PAYMENT" &&
    target.accountId !== undefined &&
    target.creditCardId === undefined
  ) {
    return "IGNORED";
  }

  // FR 5-7: the Invoice column is read on card rows only.
  const invoiceText = target.creditCardId ? cell(row, "invoice") : "";
  const invoiceMonth =
    invoiceText === "" ? undefined : parseInvoiceMonth(invoiceText);

  if (invoiceText !== "" && invoiceMonth === undefined) {
    return { display, error: "INVOICE_MONTH_INVALID", line };
  }

  // FR 3: card and account together are a payment made from that account.
  const payment =
    target.accountId !== undefined &&
    target.creditCardId !== undefined &&
    isPaymentCategory(categoryId);
  const paidValue = input.valueMaps.paid[cell(row, "paid")];
  const currency = cell(row, "currency").toUpperCase();
  const tags = splitTags(cell(row, "tags"));
  const notes = cell(row, "notes");

  return {
    display,
    line,
    payload: {
      accountId: payment ? undefined : target.accountId,
      categoryId,
      creditCardId: target.creditCardId,
      currency: currency === "" ? undefined : currency,
      date,
      description,
      invoiceMonth,
      line,
      notes: notes === "" ? undefined : notes,
      owner: input.ownerTypes[ownerId],
      ownerId,
      paid: typeof paidValue === "boolean" ? paidValue : undefined,
      paidFromAccountId: payment ? target.accountId : undefined,
      tags: tags.length > 0 ? tags : undefined,
      type: amount.type,
      value: amount.value,
    },
  };
}

// FR 27, 28, 34: one payload per data row from the mappings; system rows are left out and counted.
function buildRows(input: BuildInput): BuildResult {
  const built: BuiltRow[] = [];
  let ignoredSystemRows = 0;
  function cell(row: string[], target: ColumnTarget): string {
    const [column] = columnsOf(input.mapping, target);

    return column === undefined ? "" : (row[column] ?? "").trim();
  }

  input.rows.forEach((row, index) => {
    const line = index + 2;
    const categoryText = cell(row, "category");

    if (categoryText !== "" && isSystemCategoryName(categoryText)) {
      ignoredSystemRows += 1;

      return;
    }

    const result = buildRow(input, row, line, cell);

    if (result === "IGNORED") {
      ignoredSystemRows += 1;
    } else {
      built.push(result);
    }
  });

  return { ignoredSystemRows, rows: built };
}

// Categories are matched per type (`EXPENSE|Mercado`): income and expense can share a name.
function categoryOf(
  input: BuildInput,
  ownerId: string,
  text: string,
  type: RowType,
): string | undefined {
  return text === ""
    ? input.fixed.categoryId
    : (input.valueMaps.category[categoryKey(ownerId, type, text)] ??
        input.fixed.categoryId);
}

// FR 16: Amount + Type, Signed amount, or Income + Expense columns.
function readAmount(
  input: BuildInput,
  cell: CellReader,
  row: string[],
): { error: LocalRowErrorCode } | { type: RowType; value: number } {
  function has(target: ColumnTarget): boolean {
    return columnsOf(input.mapping, target).length > 0;
  }

  if (has("signedAmount")) {
    const parsed = parseAmountCents(cell(row, "signedAmount"), input.decimal);

    return parsed
      ? { type: parsed.negative ? "EXPENSE" : "INCOME", value: parsed.cents }
      : { error: "INVALID_VALUE" };
  }

  if (has("incomeAmount") && has("expenseAmount")) {
    const income = parseAmountCents(cell(row, "incomeAmount"), input.decimal);
    const expense = parseAmountCents(cell(row, "expenseAmount"), input.decimal);

    if (Boolean(income) === Boolean(expense)) {
      return { error: "AMOUNT_BOTH_OR_NONE" };
    }

    return income
      ? { type: "INCOME", value: income.cents }
      : { type: "EXPENSE", value: (expense as { cents: number }).cents };
  }

  const parsed = parseAmountCents(cell(row, "amount"), input.decimal);

  if (!parsed) {
    return { error: "INVALID_VALUE" };
  }

  const type = typeOf(input, cell(row, "type"));

  return type ? { type, value: parsed.cents } : { error: "TYPE_MISSING" };
}

// Tags are separated by "|" (the app export), ";" or ",".
function splitTags(text: string): string[] {
  return text
    .split(/[|;,]/)
    .map((tag) => tag.trim())
    .filter((tag) => tag !== "");
}

function typeOf(input: BuildInput, text: string): RowType | undefined {
  return text === ""
    ? input.fixed.type
    : (input.valueMaps.type[text] ?? input.fixed.type);
}

export type { BuildInput, BuildResult, BuiltRow, LocalRowErrorCode };
export { buildRows };
