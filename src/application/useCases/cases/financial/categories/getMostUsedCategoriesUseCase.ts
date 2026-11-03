import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { IUseCaseFactoryWithParamResponse } from "@application/useCases/types";
import { DefaultError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

export interface GetMostUsedCategoriesUseCaseParams {
  limit?: number;
  now?: Date;
  ownerId: string;
  type: string;
}

const DEFAULT_LIMIT = 5;
const WINDOW_DAYS = 90;
// Rows dated later still count (future-dated rows, invoices the window's card purchases land on), up to this far ahead.
const FUTURE_DAYS = 366;

function getMostUsedCategoriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetMostUsedCategoriesUseCaseParams,
  CategoryDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const today = startOfDay(params.now ?? new Date());
        const cutoff = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - WINDOW_DAYS,
        );
        const until = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + FUTURE_DAYS,
        );
        const [transactions, categories] = await Promise.all([
          repositories.financialRepository.transaction.getTransactions(
            [params.ownerId],
            { from: toDateKey(cutoff), to: toDateKey(until) },
          ),
          repositories.financialRepository.category.getCategories([
            params.ownerId,
          ]),
        ]);

        const counts = new Map<string, number>();
        transactions.forEach((transaction) => {
          if (
            transaction.type === params.type &&
            transaction.ownerId === params.ownerId &&
            startOfDay(new Date(transaction.date)) >= cutoff
          ) {
            counts.set(
              transaction.categoryId,
              (counts.get(transaction.categoryId) ?? 0) + 1,
            );
          }
        });

        return categories
          .filter(
            (category) =>
              category.type === params.type &&
              category.scopeOwnerIds.includes(params.ownerId),
          )
          .sort(
            (a, b) =>
              (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0) ||
              a.name.localeCompare(b.name),
          )
          .slice(0, params.limit ?? DEFAULT_LIMIT)
          .map((category) => CategoryDTO.fromEntity(category));
      } catch (error) {
        if (error instanceof DefaultError) {
          error.addContext({
            useCase: "financial.getMostUsedCategoriesUseCase",
          });
        }

        throw error;
      }
    },
    uniqueName: "financial.get_most_used_categories_use_case",
  };
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// `YYYY-MM-DD` of the local day.
function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default getMostUsedCategoriesUseCase;
