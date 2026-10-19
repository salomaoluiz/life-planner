import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { InvoiceStatus } from "@domain/entities/financial/InvoiceEntity";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import Repositories from "@domain/repositories";
import { decimalStringToCents } from "@utils/money";

export interface GetMonthSummaryUseCaseParams {
  // Any date inside the wanted month: only the local year and month are read.
  month: Date;
  ownerIds: string[];
}

function getMonthSummaryUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetMonthSummaryUseCaseParams,
  MonthSummaryDTO
> {
  return {
    execute: async (params) => {
      try {
        const [transactions, invoices] = await Promise.all([
          repositories.financialRepository.transaction.getTransactions(
            params.ownerIds,
          ),
          // Card purchases count on the month their invoice is paid (spec 029 FR 25).
          repositories.financialRepository.creditCard.getCardInvoicesForMonth({
            month: toMonthKey(params.month),
            ownerIds: params.ownerIds,
          }),
        ]);

        // Only the months after the current one have projected occurrences (spec 034 FR 15).
        const { projectedExpense, projectedIncome } = await projectedTotals(
          repositories,
          params,
        );
        let income = 0;
        let expense = 0;
        let toPay = 0;
        let toReceive = 0;

        transactions
          .filter(
            (transaction) =>
              // The repository cache holds every owner's transactions: narrow here.
              params.ownerIds.includes(transaction.ownerId) &&
              !transaction.creditCardId &&
              !transaction.excludeFromTotals &&
              isInMonth(transaction.date, params.month),
          )
          .forEach((transaction) => {
            const cents = decimalStringToCents(transaction.value);

            if (transaction.type === TransactionType.INCOME) {
              income += cents;
              toReceive += transaction.paid ? 0 : cents;
            } else {
              expense += cents;
              toPay += transaction.paid ? 0 : cents;
            }
          });

        invoices
          .filter((item) => params.ownerIds.includes(item.card.ownerId))
          .forEach((item) => {
            // What is due plus what was paid early: credits lower the expense, early payments only move money (spec 032 FR 9).
            expense += item.invoice.amount + item.invoice.earlyPaid;
            // An invoice that is paid (or settled by credits) has nothing left to pay (spec 033 FR 16).
            if (item.invoice.status !== InvoiceStatus.PAID) {
              toPay += item.invoice.amountDue;
            }
          });

        return new MonthSummaryDTO({
          balance: income - expense,
          expense,
          income,
          projectedExpense,
          projectedIncome,
          toPay,
          toReceive,
        });
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "home.getMonthSummaryUseCase" });
          throw error;
        }

        throw error;
      }
    },
    uniqueName: "home.get_month_summary_use_case",
  };
}

// `date` is the ISO string of the LOCAL calendar day (see calendarDateToIso).
function isInMonth(isoDate: string, month: Date): boolean {
  const date = new Date(isoDate);

  return (
    date.getFullYear() === month.getFullYear() &&
    date.getMonth() === month.getMonth()
  );
}

function laterMonth(a: string, b: string) {
  return a > b ? a : b;
}

// The expense and income that series will add to the month: account occurrences dated in it and card
// occurrences whose invoice appears in it (the cash view of spec 029 FR 25).
async function projectedTotals(
  repositories: Repositories,
  params: GetMonthSummaryUseCaseParams,
) {
  const monthKey = toMonthKey(params.month);
  const currentKey = toMonthKey(new Date());
  let projectedExpense = 0;
  let projectedIncome = 0;

  if (monthKey <= currentKey || params.ownerIds.length === 0) {
    return { projectedExpense, projectedIncome };
  }

  // A card purchase appears on the invoice up to two months later.
  const from = laterMonth(
    shiftMonthKey(monthKey, -2),
    shiftMonthKey(currentKey, 1),
  );
  const items =
    await repositories.financialRepository.recurrence.getProjections({
      from,
      ownerIds: params.ownerIds,
      to: monthKey,
    });

  items
    .filter((item) => params.ownerIds.includes(item.ownerId))
    .forEach((item) => {
      const cents = decimalStringToCents(item.value);

      if (item.creditCardId) {
        if (item.invoiceListDate?.slice(0, 7) === monthKey) {
          projectedExpense += cents;
        }

        return;
      }
      if (!isInMonth(item.date, params.month)) {
        return;
      }
      if (item.type === TransactionType.INCOME) {
        projectedIncome += cents;
      } else {
        projectedExpense += cents;
      }
    });

  return { projectedExpense, projectedIncome };
}

// "2026-10" + 3 -> "2027-01".
function shiftMonthKey(month: string, delta: number) {
  const [year, value] = month.split("-").map(Number);
  const index = year * 12 + (value - 1) + delta;

  return `${Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}`;
}

// `YYYY-MM` of the local month.
function toMonthKey(month: Date): string {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

export default getMonthSummaryUseCase;
