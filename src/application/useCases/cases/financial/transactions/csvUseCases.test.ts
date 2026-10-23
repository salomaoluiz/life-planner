import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import {
  BusinessError,
  FieldInvalid,
  ImportRowsInvalid,
} from "@domain/entities/errors";

import exportTransactionsUseCase from "./exportTransactionsUseCase";
import getExportCountUseCase from "./getExportCountUseCase";
import {
  importTransactionsUseCase,
  validateImportUseCase,
} from "./importTransactionsUseCase";

const repository = repositoriesMocks.financialRepository.transaction;
const query = { from: "2026-01-01", owner: "ALL" as const, to: "2026-12-31" };
const importParams = {
  owner: "USER",
  ownerId: "o1",
  rows: [
    {
      accountId: "a1",
      categoryId: "c1",
      date: "2026-10-02",
      description: "Mercado",
      line: 2,
      type: "EXPENSE" as const,
      value: 31240,
    },
  ],
};

beforeEach(() => jest.clearAllMocks());

describe("getExportCountUseCase", () => {
  it("SHOULD return the repository count", async () => {
    jest.mocked(repository.getExportCount).mockResolvedValueOnce(7);

    expect(await getExportCountUseCase(repositoriesMocks).execute(query)).toBe(
      7,
    );
    expect(repository.getExportCount).toHaveBeenCalledWith(query);
  });

  it("SHOULD add its context to a business error and rethrow", async () => {
    const error = new BusinessError();

    jest.mocked(repository.getExportCount).mockRejectedValueOnce(error);

    await expect(
      getExportCountUseCase(repositoriesMocks).execute(query),
    ).rejects.toBe(error);
    expect(error).toHaveProperty(
      "context.useCase",
      "financial.getExportCountUseCase",
    );
  });
});

describe("exportTransactionsUseCase", () => {
  const request = { ...query, format: "BR" as const, lang: "pt-BR" };

  it("SHOULD return the file of the repository", async () => {
    jest
      .mocked(repository.exportTransactions)
      .mockResolvedValueOnce({ csv: "a", filename: "f.csv" });

    expect(
      await exportTransactionsUseCase(repositoriesMocks).execute(request),
    ).toEqual({ csv: "a", filename: "f.csv" });
    expect(repository.exportTransactions).toHaveBeenCalledWith(request);
  });

  it("SHOULD add its context to a business error and rethrow", async () => {
    const error = new BusinessError();

    jest.mocked(repository.exportTransactions).mockRejectedValueOnce(error);

    await expect(
      exportTransactionsUseCase(repositoriesMocks).execute(request),
    ).rejects.toBe(error);
    expect(error).toHaveProperty(
      "context.useCase",
      "financial.exportTransactionsUseCase",
    );
  });
});

describe("validateImportUseCase", () => {
  it("SHOULD send the typed owner and return the dry run", async () => {
    jest
      .mocked(repository.validateImport)
      .mockResolvedValueOnce({ duplicates: [2], errors: [], invoices: [] });

    expect(
      await validateImportUseCase(repositoriesMocks).execute(importParams),
    ).toEqual({ duplicates: [2], errors: [], invoices: [] });
    expect(repository.validateImport).toHaveBeenCalledWith(
      expect.objectContaining({ owner: "USER", ownerId: "o1" }),
    );
  });

  it("SHOULD refuse an unknown owner", async () => {
    await expect(
      validateImportUseCase(repositoriesMocks).execute({
        ...importParams,
        owner: "NOPE",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
  });

  it("SHOULD add its context to a business error and rethrow", async () => {
    const error = new BusinessError();

    jest.mocked(repository.validateImport).mockRejectedValueOnce(error);

    await expect(
      validateImportUseCase(repositoriesMocks).execute(importParams),
    ).rejects.toBe(error);
    expect(error).toHaveProperty(
      "context.useCase",
      "financial.validateImportUseCase",
    );
  });
});

describe("importTransactionsUseCase", () => {
  it("SHOULD return how many rows were created", async () => {
    jest.mocked(repository.importTransactions).mockResolvedValueOnce(1);

    expect(
      await importTransactionsUseCase(repositoriesMocks).execute(importParams),
    ).toBe(1);
  });

  it("SHOULD refuse an unknown owner", async () => {
    await expect(
      importTransactionsUseCase(repositoriesMocks).execute({
        ...importParams,
        owner: "NOPE",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
  });

  it("SHOULD rethrow the rows the API refused, with its context", async () => {
    const error = new ImportRowsInvalid([
      { code: "INVALID_DATE", line: 2, message: "Invalid date" },
    ]);

    jest.mocked(repository.importTransactions).mockRejectedValueOnce(error);

    await expect(
      importTransactionsUseCase(repositoriesMocks).execute(importParams),
    ).rejects.toBe(error);
    expect(error).toHaveProperty(
      "context.useCase",
      "financial.importTransactionsUseCase",
    );
  });
});
