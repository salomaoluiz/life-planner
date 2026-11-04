import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import { FinanceMonthSummaryEntity } from "@domain/entities/financial/FinanceMonthEntity";
import Repositories from "@domain/repositories";

// Spec 080: what the transactions screen shows for one month. `items` are the account rows; card purchases are on
// their invoice.
export interface FinanceMonthDTO {
  dailyBalances: DailyBalanceDTO;
  invoices: CardInvoiceDTO[];
  items: TransactionDTO[];
  projections: ProjectedOccurrenceDTO[];
  summary: FinanceMonthSummaryEntity;
}

export interface GetFinanceMonthUseCaseParams {
  // `YYYY-MM`
  month: string;
  ownerIds: string[];
}

function getFinanceMonthUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetFinanceMonthUseCaseParams,
  FinanceMonthDTO
> {
  return {
    execute: async (params) => {
      try {
        const [month, categories, accounts] = await Promise.all([
          repositories.financialRepository.transaction.getFinanceMonth(params),
          repositories.financialRepository.category.getCategories(
            params.ownerIds,
          ),
          repositories.financialRepository.account.getAccounts(params.ownerIds),
        ]);

        return {
          dailyBalances: DailyBalanceDTO.fromEntity(month.dailyBalances),
          invoices: month.invoices.map((invoice) =>
            CardInvoiceDTO.fromEntity(invoice),
          ),
          items: month.transactions.map((transaction) =>
            TransactionDTO.fromEntity(
              transaction,
              categories.find((c) => c.id === transaction.categoryId)?.name,
              accounts.find((a) => a.id === transaction.accountId)?.name,
            ),
          ),
          projections: month.projections.map((item) =>
            ProjectedOccurrenceDTO.fromEntity(item),
          ),
          summary: month.summary,
        };
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({ useCase: "financial.getFinanceMonthUseCase" });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_finance_month_use_case",
  };
}

export default getFinanceMonthUseCase;
