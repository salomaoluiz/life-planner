import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { UpdateTransactionUseCaseParams } from "@application/useCases/cases/financial/transactions/updateTransactionUseCase";
import { centsToDecimalString, decimalStringToCents } from "@utils/money";

type DateChoice = "other" | "today" | "transaction" | "yesterday";

interface PayInput {
  cents: number;
  dateIso: string;
}

const DAY_MS = 86_400_000;

function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// The row the list shows while the request runs.
function buildPaidRow(item: TransactionDTO, input: PayInput) {
  return new TransactionDTO({
    ...item,
    date: input.dateIso,
    paid: true,
    value: centsToDecimalString(input.cents),
  });
}

// Spec 097 FR 6: always `paid` and an explicit date; the value only when it changed; the scope only for a recurring
// occurrence whose value changed (only this occurrence changes).
function buildPayParams(
  item: TransactionDTO,
  input: PayInput,
): UpdateTransactionUseCaseParams {
  const valueChanged = input.cents !== decimalStringToCents(item.value);

  return {
    date: input.dateIso,
    id: item.id,
    ownerId: item.ownerId,
    paid: true,
    ...(valueChanged
      ? {
          scope: item.recurrenceId ? ("ONLY_THIS" as const) : undefined,
          value: centsToDecimalString(input.cents),
        }
      : {}),
  };
}

// Spec 097 FR 5: "Today" / "Yesterday" are hidden when the transaction already is that day.
function dateChoices(transactionDate: Date, today: Date): DateChoice[] {
  const key = dayKey(transactionDate);
  const choices: DateChoice[] = ["transaction"];

  if (key !== dayKey(today)) {
    choices.push("today");
  }
  if (key !== dayKey(addDays(today, -1))) {
    choices.push("yesterday");
  }

  return [...choices, "other"];
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function differenceCents(entered: number, original: number) {
  return entered - original;
}

function isValidPayment(cents: number) {
  return cents > 0;
}

// Whole days between a past date and today; 0 when the date is today or later.
function overdueDays(transactionDate: Date, today: Date) {
  const from = Date.UTC(
    transactionDate.getFullYear(),
    transactionDate.getMonth(),
    transactionDate.getDate(),
  );
  const to = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());

  return Math.max(0, Math.round((to - from) / DAY_MS));
}

function resolveDate(
  choice: DateChoice,
  transactionIso: string,
  other: Date | undefined,
  today: Date,
) {
  switch (choice) {
    case "other":
      return (other ?? today).toISOString();
    case "today":
      return today.toISOString();
    case "transaction":
      return transactionIso;
    case "yesterday":
      return addDays(today, -1).toISOString();
  }
}

export type { DateChoice, PayInput };
export {
  buildPaidRow,
  buildPayParams,
  dateChoices,
  differenceCents,
  isValidPayment,
  overdueDays,
  resolveDate,
};
