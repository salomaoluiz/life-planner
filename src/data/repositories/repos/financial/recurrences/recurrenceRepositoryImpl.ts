import { Datasources } from "@data/datasource";
import ProjectedOccurrenceModel from "@data/models/financial/ProjectedOccurrenceModel";
import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import TransactionModel from "@data/models/financial/TransactionModel";
import { RecurrenceResultModel } from "@data/repositories/repos/financial/recurrences/recurrenceDatasource";
import ProjectedOccurrenceEntity from "@domain/entities/financial/ProjectedOccurrenceEntity";
import RecurrenceEntity from "@domain/entities/financial/RecurrenceEntity";
import RecurrenceResultEntity from "@domain/entities/financial/RecurrenceResultEntity";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { FinancialRecurrenceRepository } from "@domain/repositories/financial";
import cache, { CacheStringKeys } from "@infrastructure/cache";

// Series writes create, move or delete transactions and so move balances.
function invalidateFinancialCaches() {
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA);
  cache.invalidate(CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA);
}

function recurrenceRepositoryImpl(
  datasources: Datasources,
): FinancialRecurrenceRepository {
  function datasource() {
    return datasources.financialRecurrenceDatasource;
  }

  return {
    async createRecurrence(params): Promise<RecurrenceResultEntity> {
      const result = await datasource().createRecurrence(params);

      invalidateFinancialCaches();

      return toResultEntity(result);
    },
    async deleteOccurrence(params): Promise<void> {
      await datasource().deleteOccurrence(params);
      invalidateFinancialCaches();
    },
    async deleteRecurrence(params) {
      const result = await datasource().deleteRecurrence(params);

      invalidateFinancialCaches();

      return result;
    },
    async getProjections(params): Promise<ProjectedOccurrenceEntity[]> {
      const models = await datasource().getProjections(params);

      return models.map((model) => toProjectedEntity(model));
    },
    async getRecurrences(params): Promise<RecurrenceEntity[]> {
      const models = await datasource().getRecurrences(params);

      return models.map((model) => toRecurrenceEntity(model));
    },
    async materializeOccurrence(params): Promise<TransactionEntity> {
      const model = await datasource().materializeOccurrence(params);

      invalidateFinancialCaches();

      return toTransactionEntity(model);
    },
    async splitRecurrence(params): Promise<RecurrenceResultEntity> {
      const result = await datasource().splitRecurrence(params);

      invalidateFinancialCaches();

      return toResultEntity(result);
    },
    async updateRecurrence(params): Promise<RecurrenceEntity> {
      const model = await datasource().updateRecurrence(params);

      invalidateFinancialCaches();

      return toRecurrenceEntity(model);
    },
  };
}

function toProjectedEntity(
  model: ProjectedOccurrenceModel,
): ProjectedOccurrenceEntity {
  return new ProjectedOccurrenceEntity({
    accountId: model.accountId,
    accountName: model.accountName,
    category: model.category,
    categoryId: model.categoryId,
    creditCardColor: model.creditCardColor,
    creditCardId: model.creditCardId,
    creditCardLastDigits: model.creditCardLastDigits,
    creditCardTitle: model.creditCardTitle,
    currency: model.currency,
    date: model.date,
    description: model.description,
    frequency: model.frequency,
    invoiceListDate: model.invoiceListDate,
    invoiceMonth: model.invoiceMonth,
    occurrenceCount: model.occurrenceCount,
    occurrenceNumber: model.occurrenceNumber,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    recurrenceId: model.recurrenceId,
    type: TransactionType[model.type],
    value: model.value,
  });
}

function toRecurrenceEntity(model: RecurrenceModel): RecurrenceEntity {
  return new RecurrenceEntity({
    accountId: model.accountId,
    category: model.category,
    categoryId: model.categoryId,
    creditCardId: model.creditCardId,
    currency: model.currency,
    description: model.description,
    endDate: model.endDate,
    firstNumber: model.firstNumber,
    frequency: model.frequency,
    id: model.id,
    nextOccurrenceDate: model.nextOccurrenceDate,
    occurrenceCount: model.occurrenceCount,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    startDate: model.startDate,
    status: model.status,
    type: TransactionType[model.type],
    value: model.value,
  });
}

function toResultEntity(result: RecurrenceResultModel): RecurrenceResultEntity {
  return new RecurrenceResultEntity({
    ended: result.ended ? toRecurrenceEntity(result.ended) : undefined,
    occurrences: result.occurrences.map((row) => toTransactionEntity(row)),
    overLimit: result.overLimit,
    recurrence: toRecurrenceEntity(result.recurrence),
  });
}

function toTransactionEntity(model: TransactionModel): TransactionEntity {
  return new TransactionEntity({
    accountId: model.accountId,
    category: model.category,
    categoryId: model.categoryId,
    creditCardId: model.creditCardId,
    currency: model.currency,
    date: model.date,
    description: model.description,
    earlyPayment: model.earlyPayment,
    excludeFromTotals: model.excludeFromTotals,
    id: model.id,
    installmentCount: model.installmentCount,
    installmentNumber: model.installmentNumber,
    installmentPlanId: model.installmentPlanId,
    invoiceMonth: model.invoiceMonth,
    occurrenceCount: model.occurrenceCount,
    occurrenceNumber: model.occurrenceNumber,
    owner: OwnerType[model.owner],
    ownerId: model.ownerId,
    paid: model.paid,
    recurrenceFrequency: model.recurrenceFrequency,
    recurrenceId: model.recurrenceId,
    systemKey: model.systemKey,
    type: TransactionType[model.type],
    value: model.value,
  });
}

export default recurrenceRepositoryImpl;
export { toProjectedEntity, toRecurrenceEntity, toResultEntity };
