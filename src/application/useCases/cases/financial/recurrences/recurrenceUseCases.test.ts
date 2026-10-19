import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import RecurrenceResultDTO from "@application/dto/financial/RecurrenceResultDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import {
  DefaultError,
  FieldInvalid,
  GenericError,
  RecurrenceHasPaidOccurrences,
} from "@domain/entities/errors";
import ProjectedOccurrenceEntity from "@domain/entities/financial/ProjectedOccurrenceEntity";
import RecurrenceEntity from "@domain/entities/financial/RecurrenceEntity";
import RecurrenceResultEntity from "@domain/entities/financial/RecurrenceResultEntity";
import TransactionEntity, {
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import Repositories from "@domain/repositories";

import createRecurrenceUseCase from "./createRecurrenceUseCase";
import deleteOccurrenceUseCase from "./deleteOccurrenceUseCase";
import deleteRecurrenceUseCase from "./deleteRecurrenceUseCase";
import getProjectionsUseCase from "./getProjectionsUseCase";
import getRecurrencesUseCase from "./getRecurrencesUseCase";
import materializeOccurrenceUseCase from "./materializeOccurrenceUseCase";
import splitRecurrenceUseCase from "./splitRecurrenceUseCase";
import updateRecurrenceUseCase from "./updateRecurrenceUseCase";

const series = new RecurrenceEntity({
  accountId: "account-1",
  category: "Rent",
  categoryId: "category-1",
  description: "Rent",
  endDate: "2027-09-05T03:00:00.000Z",
  firstNumber: 1,
  frequency: "MONTHLY",
  id: "recurrence-1",
  occurrenceCount: 12,
  owner: OwnerType.USER,
  ownerId: "user-id",
  startDate: "2026-10-05T03:00:00.000Z",
  status: "ACTIVE",
  type: TransactionType.EXPENSE,
  value: "2000.00",
});
const transaction = new TransactionEntity({
  category: "Rent",
  categoryId: "category-1",
  date: "2026-10-05T03:00:00.000Z",
  description: "Rent",
  id: "transaction-1",
  owner: OwnerType.USER,
  ownerId: "user-id",
  type: TransactionType.EXPENSE,
  value: "2000.00",
});
const projected = new ProjectedOccurrenceEntity({
  accountId: "account-1",
  accountName: "Checking",
  category: "Rent",
  categoryId: "category-1",
  date: "2026-11-05T03:00:00.000Z",
  description: "Rent",
  frequency: "MONTHLY",
  occurrenceNumber: 2,
  owner: OwnerType.USER,
  ownerId: "user-id",
  recurrenceId: "recurrence-1",
  type: TransactionType.EXPENSE,
  value: "2000.00",
});
const resultEntity = new RecurrenceResultEntity({
  occurrences: [transaction],
  overLimit: true,
  recurrence: series,
});

const recurrences = {
  createRecurrence: jest.fn(),
  deleteOccurrence: jest.fn(),
  deleteRecurrence: jest.fn(),
  getProjections: jest.fn(),
  getRecurrences: jest.fn(),
  materializeOccurrence: jest.fn(),
  splitRecurrence: jest.fn(),
  updateRecurrence: jest.fn(),
};
const repositories = {
  financialRepository: { recurrence: recurrences },
} as unknown as Repositories;

const createParams = {
  accountId: "account-1",
  categoryId: "category-1",
  date: "2026-10-05T03:00:00.000Z",
  description: "Rent",
  endDate: "2027-09-05T03:00:00.000Z",
  frequency: "MONTHLY",
  owner: "USER",
  ownerId: "user-id",
  type: "EXPENSE",
  value: "2000.00",
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.values(recurrences).forEach((fn) => fn.mockResolvedValue(undefined));
  recurrences.createRecurrence.mockResolvedValue(resultEntity);
  recurrences.getProjections.mockResolvedValue([projected]);
  recurrences.getRecurrences.mockResolvedValue([series]);
  recurrences.materializeOccurrence.mockResolvedValue(transaction);
  recurrences.splitRecurrence.mockResolvedValue(resultEntity);
  recurrences.updateRecurrence.mockResolvedValue(series);
});

describe("createRecurrenceUseCase", () => {
  const useCase = createRecurrenceUseCase(repositories);

  it("SHOULD create the series AND return the result DTO", async () => {
    const result = await useCase.execute(createParams);

    expect(result).toBeInstanceOf(RecurrenceResultDTO);
    expect(result.overLimit).toBe(true);
    expect(result.occurrences[0]).toBeInstanceOf(TransactionDTO);
    expect(recurrences.createRecurrence).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: "MONTHLY",
        owner: OwnerType.USER,
        type: TransactionType.EXPENSE,
      }),
    );
  });

  it.each([
    ["owner", { owner: "NOBODY" }],
    ["type", { type: "OTHER" }],
    ["frequency", { frequency: "DAILY" }],
    ["endDate", { endDate: "2026-10-01T03:00:00.000Z" }],
  ])(
    "SHOULD reject an invalid %s WITHOUT calling the repository",
    async (_n, patch) => {
      await expect(
        useCase.execute({ ...createParams, ...patch }),
      ).rejects.toBeInstanceOf(FieldInvalid);
      expect(recurrences.createRecurrence).not.toHaveBeenCalled();
    },
  );

  it("SHOULD add context to a default error AND re-throw anything else", async () => {
    const error = new GenericError();
    const spy = jest.spyOn(error, "addContext");
    recurrences.createRecurrence.mockRejectedValueOnce(error);

    await expect(useCase.execute(createParams)).rejects.toBe(error);
    expect(spy).toHaveBeenCalledWith({
      useCase: "financial.createRecurrenceUseCase",
    });

    recurrences.createRecurrence.mockRejectedValueOnce(new Error("boom"));
    await expect(useCase.execute(createParams)).rejects.toThrow("boom");
  });
});

describe("reads", () => {
  it("SHOULD return the projections as DTOs AND turn one into a muted transaction row", async () => {
    const [dto] = await getProjectionsUseCase(repositories).execute({
      from: "2026-11",
      ownerIds: ["user-id"],
      to: "2026-11",
    });

    expect(dto).toBeInstanceOf(ProjectedOccurrenceDTO);

    const row = dto.toTransactionDTO();

    expect(row).toMatchObject({
      accountName: "Checking",
      categoryName: "Rent",
      id: "projected-recurrence-1-2",
      isProjected: true,
      occurrenceNumber: 2,
      paid: false,
      recurrenceFrequency: "MONTHLY",
      recurrenceId: "recurrence-1",
    });
  });

  it("SHOULD return the series of a source as DTOs", async () => {
    const [dto] = await getRecurrencesUseCase(repositories).execute({
      accountId: "account-1",
      status: "ACTIVE",
    });

    expect(dto).toBeInstanceOf(RecurrenceDTO);
    expect(recurrences.getRecurrences).toHaveBeenCalledWith({
      accountId: "account-1",
      status: "ACTIVE",
    });
  });
});

describe("writes", () => {
  it("SHOULD update a series", async () => {
    const result = await updateRecurrenceUseCase(repositories).execute({
      id: "recurrence-1",
      value: "2100.00",
    });

    expect(result).toBeInstanceOf(RecurrenceDTO);
  });

  it("SHOULD materialize a projected occurrence into a transaction DTO", async () => {
    const result = await materializeOccurrenceUseCase(repositories).execute({
      occurrenceNumber: 2,
      recurrenceId: "recurrence-1",
      value: "2100.00",
    });

    expect(result).toBeInstanceOf(TransactionDTO);
  });

  it("SHOULD split with a valid frequency AND without one", async () => {
    const useCase = splitRecurrenceUseCase(repositories);

    expect(
      await useCase.execute({
        frequency: "WEEKLY",
        occurrenceNumber: 5,
        recurrenceId: "recurrence-1",
      }),
    ).toBeInstanceOf(RecurrenceResultDTO);
    expect(recurrences.splitRecurrence).toHaveBeenLastCalledWith(
      expect.objectContaining({ frequency: "WEEKLY" }),
    );

    await useCase.execute({
      occurrenceNumber: 5,
      recurrenceId: "recurrence-1",
    });
    expect(recurrences.splitRecurrence).toHaveBeenLastCalledWith(
      expect.objectContaining({ frequency: undefined }),
    );
  });

  it("SHOULD reject an unknown frequency on a split", async () => {
    await expect(
      splitRecurrenceUseCase(repositories).execute({
        frequency: "DAILY",
        occurrenceNumber: 5,
        recurrenceId: "recurrence-1",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
  });
});

describe("deletes", () => {
  it("SHOULD delete an occurrence by scope AND a series with its counts", async () => {
    recurrences.deleteRecurrence.mockResolvedValue({ deleted: 2, detached: 1 });

    await deleteOccurrenceUseCase(repositories).execute({
      occurrenceNumber: 4,
      recurrenceId: "recurrence-1",
      scope: "ONLY_THIS",
    });

    expect(recurrences.deleteOccurrence).toHaveBeenCalledWith({
      occurrenceNumber: 4,
      recurrenceId: "recurrence-1",
      scope: "ONLY_THIS",
    });
    expect(
      await deleteRecurrenceUseCase(repositories).execute({
        confirmPaid: true,
        id: "recurrence-1",
      }),
    ).toEqual({ deleted: 2, detached: 1 });
  });

  it("SHOULD let the paid-occurrences conflict through with its context", async () => {
    const error = new RecurrenceHasPaidOccurrences({
      detachedCount: 0,
      paidCount: 2,
      paidTotal: 100,
    });
    recurrences.deleteRecurrence.mockRejectedValueOnce(error);
    recurrences.deleteOccurrence.mockRejectedValueOnce(error);

    await expect(
      deleteRecurrenceUseCase(repositories).execute({ id: "recurrence-1" }),
    ).rejects.toBe(error);
    await expect(
      deleteOccurrenceUseCase(repositories).execute({
        occurrenceNumber: 4,
        recurrenceId: "recurrence-1",
        scope: "THIS_AND_NEXT",
      }),
    ).rejects.toBe(error);
    expect(error).toBeInstanceOf(DefaultError);
  });

  it("SHOULD re-throw unknown failures of every use case", async () => {
    Object.values(recurrences).forEach((fn) =>
      fn.mockRejectedValue(new Error("boom")),
    );

    await expect(
      getProjectionsUseCase(repositories).execute({
        from: "2026-11",
        ownerIds: ["u"],
        to: "2026-11",
      }),
    ).rejects.toThrow("boom");
    await expect(
      getRecurrencesUseCase(repositories).execute({}),
    ).rejects.toThrow("boom");
    await expect(
      updateRecurrenceUseCase(repositories).execute({ id: "r" }),
    ).rejects.toThrow("boom");
    await expect(
      materializeOccurrenceUseCase(repositories).execute({
        occurrenceNumber: 1,
        recurrenceId: "r",
      }),
    ).rejects.toThrow("boom");
    await expect(
      splitRecurrenceUseCase(repositories).execute({
        occurrenceNumber: 1,
        recurrenceId: "r",
      }),
    ).rejects.toThrow("boom");
    await expect(
      deleteOccurrenceUseCase(repositories).execute({
        occurrenceNumber: 1,
        recurrenceId: "r",
        scope: "ONLY_THIS",
      }),
    ).rejects.toThrow("boom");
    await expect(
      deleteRecurrenceUseCase(repositories).execute({ id: "r" }),
    ).rejects.toThrow("boom");
  });

  it("SHOULD add the use case to a DefaultError of every use case", async () => {
    function make() {
      return new GenericError();
    }
    const cases: [() => Promise<unknown>, keyof typeof recurrences, string][] =
      [
        [
          async () =>
            getProjectionsUseCase(repositories).execute({
              from: "2026-11",
              ownerIds: ["u"],
              to: "2026-11",
            }),
          "getProjections",
          "financial.getProjectionsUseCase",
        ],
        [
          async () => getRecurrencesUseCase(repositories).execute({}),
          "getRecurrences",
          "financial.getRecurrencesUseCase",
        ],
        [
          async () =>
            updateRecurrenceUseCase(repositories).execute({ id: "r" }),
          "updateRecurrence",
          "financial.updateRecurrenceUseCase",
        ],
        [
          async () =>
            materializeOccurrenceUseCase(repositories).execute({
              occurrenceNumber: 1,
              recurrenceId: "r",
            }),
          "materializeOccurrence",
          "financial.materializeOccurrenceUseCase",
        ],
        [
          async () =>
            splitRecurrenceUseCase(repositories).execute({
              occurrenceNumber: 1,
              recurrenceId: "r",
            }),
          "splitRecurrence",
          "financial.splitRecurrenceUseCase",
        ],
        [
          async () =>
            deleteOccurrenceUseCase(repositories).execute({
              occurrenceNumber: 1,
              recurrenceId: "r",
              scope: "ONLY_THIS",
            }),
          "deleteOccurrence",
          "financial.deleteOccurrenceUseCase",
        ],
        [
          async () =>
            deleteRecurrenceUseCase(repositories).execute({ id: "r" }),
          "deleteRecurrence",
          "financial.deleteRecurrenceUseCase",
        ],
      ];

    for (const [run, method, name] of cases) {
      const error = make();
      const spy = jest.spyOn(error, "addContext");

      recurrences[method].mockRejectedValueOnce(error);
      await expect(run()).rejects.toBe(error);
      expect(spy).toHaveBeenCalledWith({ useCase: name });
    }
  });
});
