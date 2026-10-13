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
        const transactions =
          await repositories.financialRepository.transaction.getTransactions(
            params.ownerIds,
          );

        let income = 0;
        let expense = 0;

        transactions
          .filter((transaction) => isInMonth(transaction.date, params.month))
          .forEach((transaction) => {
            if (transaction.type === TransactionType.INCOME) {
              income += decimalStringToCents(transaction.value);
            } else {
              expense += decimalStringToCents(transaction.value);
            }
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

export default getMonthSummaryUseCase;
