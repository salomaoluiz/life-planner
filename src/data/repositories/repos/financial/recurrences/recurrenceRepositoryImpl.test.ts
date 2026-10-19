import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import {
  apiProjected,
  apiRecurrence,
  apiRecurringTransaction,
} from "@data/models/financial/mocks/Recurrence.mocks";
import ProjectedOccurrenceModel from "@data/models/financial/ProjectedOccurrenceModel";
import RecurrenceModel from "@data/models/financial/RecurrenceModel";
import TransactionModel from "@data/models/financial/TransactionModel";
import ProjectedOccurrenceEntity from "@domain/entities/financial/ProjectedOccurrenceEntity";
import RecurrenceEntity from "@domain/entities/financial/RecurrenceEntity";
import RecurrenceResultEntity from "@domain/entities/financial/RecurrenceResultEntity";
import TransactionEntity from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import recurrenceRepositoryImpl from "./recurrenceRepositoryImpl";

const datasource = jest.mocked(datasourcesMocks.financialRecurrenceDatasource);
const repository = recurrenceRepositoryImpl(datasourcesMocks);

const resultModel = {
  ended: RecurrenceModel.fromJSON(apiRecurrence),
  occurrences: [TransactionModel.fromJSON(apiRecurringTransaction)],
  overLimit: true,
  recurrence: RecurrenceModel.fromJSON(apiRecurrence),
};

function expectCachesInvalidated() {
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(cache, "invalidate").mockImplementation(() => undefined);
});

it("SHOULD create a series, return the entities AND invalidate the transaction and account caches", async () => {
  datasource.createRecurrence.mockResolvedValueOnce(resultModel);

  const result = await repository.createRecurrence({
    accountId: "account-1",
    categoryId: "category-1",
    date: "2026-10-05T03:00:00.000Z",
    description: "Rent",
    frequency: "MONTHLY",
    owner: OwnerType.USER,
    ownerId: "user-id",
    type: "EXPENSE" as never,
    value: "2000.00",
  });

  expect(result).toBeInstanceOf(RecurrenceResultEntity);
  expect(result.recurrence).toBeInstanceOf(RecurrenceEntity);
  expect(result.recurrence.owner).toBe(OwnerType.USER);
  expect(result.occurrences[0]).toBeInstanceOf(TransactionEntity);
  expect(result.occurrences[0].recurrenceId).toBe("recurrence-1");
  expect(result.overLimit).toBe(true);
  expectCachesInvalidated();
});

it("SHOULD split AND update through the datasource AND invalidate the caches", async () => {
  datasource.splitRecurrence.mockResolvedValueOnce(resultModel);
  datasource.updateRecurrence.mockResolvedValueOnce(resultModel.recurrence);

  const split = await repository.splitRecurrence({
    occurrenceNumber: 5,
    recurrenceId: "recurrence-1",
    value: "2200.00",
  });
  const updated = await repository.updateRecurrence({
    id: "recurrence-1",
    value: "2100.00",
  });

  expect(split.ended).toBeInstanceOf(RecurrenceEntity);
  expect(updated.id).toBe("recurrence-1");
  expectCachesInvalidated();
});

it("SHOULD map a result without an ended series", async () => {
  datasource.splitRecurrence.mockResolvedValueOnce({
    ...resultModel,
    ended: undefined,
  });

  expect(
    (
      await repository.splitRecurrence({
        occurrenceNumber: 1,
        recurrenceId: "r",
      })
    ).ended,
  ).toBeUndefined();
});

it("SHOULD delete one occurrence AND a series AND invalidate the caches", async () => {
  datasource.deleteRecurrence.mockResolvedValueOnce({
    deleted: 2,
    detached: 0,
  });

  await repository.deleteOccurrence({
    occurrenceNumber: 4,
    recurrenceId: "recurrence-1",
    scope: "ONLY_THIS",
  });
  expect(
    await repository.deleteRecurrence({
      confirmPaid: true,
      id: "recurrence-1",
    }),
  ).toEqual({ deleted: 2, detached: 0 });

  expect(datasource.deleteOccurrence).toHaveBeenCalledTimes(1);
  expectCachesInvalidated();
});

it("SHOULD materialize a projected occurrence into a transaction AND invalidate the caches", async () => {
  datasource.materializeOccurrence.mockResolvedValueOnce(
    TransactionModel.fromJSON(apiRecurringTransaction),
  );

  const result = await repository.materializeOccurrence({
    occurrenceNumber: 2,
    recurrenceId: "recurrence-1",
  });

  expect(result).toBeInstanceOf(TransactionEntity);
  expectCachesInvalidated();
});

it("SHOULD read projections AND series WITHOUT touching the caches", async () => {
  datasource.getProjections.mockResolvedValueOnce([
    ProjectedOccurrenceModel.fromJSON(apiProjected),
  ]);
  datasource.getRecurrences.mockResolvedValueOnce([
    RecurrenceModel.fromJSON(apiRecurrence),
  ]);

  const projections = await repository.getProjections({
    from: "2026-11",
    ownerIds: ["user-id"],
    to: "2026-11",
  });
  const series = await repository.getRecurrences({ accountId: "account-1" });

  expect(projections[0]).toBeInstanceOf(ProjectedOccurrenceEntity);
  expect(projections[0].owner).toBe(OwnerType.USER);
  expect(series[0]).toBeInstanceOf(RecurrenceEntity);
  expect(cache.invalidate).not.toHaveBeenCalled();
});
