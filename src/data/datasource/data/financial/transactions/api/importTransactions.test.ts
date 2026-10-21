import {
  ApiBusinessError,
  GenericError,
  ImportRowsInvalid,
} from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import { importTransactions, validateImport } from "./importTransactions";

jest.mock("@infrastructure/api", () => ({ api: { post: jest.fn() } }));
jest.mock("@data/models/financial/calendarDate", () => ({
  todayCalendarDate: () => "2026-10-21",
}));

const params = {
  owner: OwnerType.USER,
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

describe("validateImport", () => {
  it("SHOULD post the rows as a dry run with the client day", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValueOnce({ duplicates: [2], errors: [], extra: 1 });

    expect(await validateImport(params)).toEqual({
      duplicates: [2],
      errors: [],
    });
    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/transactions/import?today=2026-10-21",
      { ...params, dryRun: true },
    );
  });

  it("SHOULD wrap an unknown failure in a GenericError", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));

    await expect(validateImport(params)).rejects.toBeInstanceOf(GenericError);
  });

  it("SHOULD map an archived family to its business error", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError("Family is archived", 422, {}, {}),
      );

    await expect(validateImport(params)).rejects.toMatchObject({
      name: "FamilyArchived",
    });
  });
});

describe("importTransactions", () => {
  it("SHOULD post the rows for real and return how many were created", async () => {
    jest.mocked(api.post).mockResolvedValueOnce({ created: 1 });

    expect(await importTransactions(params)).toBe(1);
    expect(api.post).toHaveBeenCalledWith(
      "/v1/finance/transactions/import?today=2026-10-21",
      { ...params, dryRun: false },
    );
  });

  it("SHOULD turn a 422 with row errors into ImportRowsInvalid carrying them", async () => {
    const errors = [{ code: "INVALID_DATE", line: 2, message: "Invalid date" }];

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        new ApiBusinessError(
          "The import has invalid rows",
          422,
          {},
          { errors },
        ),
      );

    const failure = await importTransactions(params).catch((error) => error);

    expect(failure).toBeInstanceOf(ImportRowsInvalid);
    expect(failure.errors).toEqual(errors);
  });

  it("SHOULD keep any other failure a generic error", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));

    await expect(importTransactions(params)).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});
