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

function getMostUsedCategoriesUseCase(
  repositories: Repositories,
): IUseCaseFactoryWithParamResponse<
  GetMostUsedCategoriesUseCaseParams,
  CategoryDTO[]
> {
  return {
    execute: async (params) => {
      try {
        const [transactions, categories] = await Promise.all([
          repositories.financialRepository.transaction.getTransactions([
            params.ownerId,
          ]),
          repositories.financialRepository.category.getCategories([
            params.ownerId,
          ]),
        ]);

        const today = startOfDay(params.now ?? new Date());
        const cutoff = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() - WINDOW_DAYS,
        );

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
              category.ownerId === params.ownerId,
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

export default getMostUsedCategoriesUseCase;
