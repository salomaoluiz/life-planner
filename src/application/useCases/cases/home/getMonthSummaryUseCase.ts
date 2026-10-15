import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
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

        let income = 0;
        let expense = 0;

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
            if (transaction.type === TransactionType.INCOME) {
              income += decimalStringToCents(transaction.value);
            } else {
              expense += decimalStringToCents(transaction.value);
            }
          });

        invoices
          .filter((item) => params.ownerIds.includes(item.card.ownerId))
          .forEach((item) => {
            expense += item.invoice.amount;
          });

        return new MonthSummaryDTO({
          balance: income - expense,
          expense,
          income,
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

// `YYYY-MM` of the local month.
function toMonthKey(month: Date): string {
  return `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
}

export default getMonthSummaryUseCase;
