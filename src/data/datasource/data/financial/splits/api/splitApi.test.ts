import {
  ApiBusinessError,
  FieldInvalid,
  FinancialNotFound,
  SplitRowUseSplit,
  SplitTotalMismatch,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import createSplit from "./createSplit";
import deleteSplit from "./deleteSplit";
import getSplit from "./getSplit";
import updateSplit from "./updateSplit";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

// region mocks
const part = {
  accountId: "acc-1",
  categoryId: "cat-1",
  currency: "BRL",
  date: "2026-11-15",
  description: "Mercado",
  id: "row-1",
  owner: "USER",
  ownerId: "owner-1",
  paid: true,
  splitId: "split-1",
  splitPosition: 0,
  type: "EXPENSE",
  value: 12000,
};
const response = {
  item: {
    accountId: "acc-1",
    currency: "BRL",
    date: "2026-11-15",
    description: "Mercado",
    id: "split-1",
    owner: "USER",
    ownerId: "owner-1",
    paid: true,
    parts: [part, { ...part, id: "row-2", splitPosition: 1, value: -440 }],
    total: 11560,
    type: "EXPENSE",
  },
  lookups: {
    categories: { "cat-1": { name: "Mercearia" } },
    splits: {
      "split-1": {
        description: "Mercado",
        matchedCount: 2,
        matchedTotal: 11560,
        partCount: 2,
        total: 11560,
        type: "EXPENSE",
      },
    },
    tags: {},
  },
};
const createParams = {
  accountId: "acc-1",
  date: new Date(2026, 10, 15).toISOString(),
  description: "Mercado",
  notes: null,
  parts: [
    {
      categoryId: "cat-1",
      description: null,
      type: "EXPENSE" as const,
      value: "120,00",
    },
    {
      systemKey: "SPLIT_ADJUSTMENT" as const,
      type: "EXPENSE" as const,
      value: "-4.40",
    },
  ],
  total: "115.60",
};
// endregion mocks

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  patch: jest.mocked(api.patch),
  post: jest.mocked(api.post),
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createSplit", () => {
  it("SHOULD POST cents (the adjustment signed) AND the calendar day, then map the parts with their split lookup", async () => {
    spies.post.mockResolvedValue(response);

    const result = await createSplit({
      ...createParams,
      fromTransactionId: "row-0",
    });
    const [url, body] = spies.post.mock.calls[0];

    expect(url).toMatch(/^\/v1\/finance\/splits\?today=\d{4}-\d{2}-\d{2}$/);
    expect(body).toEqual(
      expect.objectContaining({
        accountId: "acc-1",
        date: "2026-11-15",
        description: "Mercado",
        fromTransactionId: "row-0",
        parts: [
          expect.objectContaining({ categoryId: "cat-1", value: 12000 }),
          expect.objectContaining({
            systemKey: "SPLIT_ADJUSTMENT",
            value: -440,
          }),
        ],
        total: 11560,
      }),
    );
    expect(result.split.total).toBe("115.60");
    expect(result.parts).toHaveLength(2);
    expect(result.parts[1].value).toBe("-4.40");
    expect(result.parts[0].split).toEqual(
      expect.objectContaining({ matchedTotal: "115.60", partCount: 2 }),
    );
  });

  it("SHOULD throw FieldInvalid BEFORE any request WHEN a value is zero or malformed", async () => {
    await expect(
      createSplit({
        ...createParams,
        parts: [{ ...createParams.parts[0], value: "0" }],
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      createSplit({
        ...createParams,
        parts: [{ ...createParams.parts[0], value: "abc" }],
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(spies.post).not.toHaveBeenCalled();
  });

  it("SHOULD map a 422 code to its business error", async () => {
    spies.post.mockRejectedValue(
      new ApiBusinessError("SPLIT_TOTAL_MISMATCH", 422),
    );

    await expect(createSplit(createParams)).rejects.toBeInstanceOf(
      SplitTotalMismatch,
    );
  });
});

describe("updateSplit", () => {
  it("SHOULD PATCH only paid WHEN that is all (no parts, no date)", async () => {
    spies.patch.mockResolvedValue(response);

    await updateSplit({ id: "split-1", paid: false });

    expect(spies.patch.mock.calls[0][1]).toEqual(
      expect.objectContaining({
        date: undefined,
        paid: false,
        parts: undefined,
      }),
    );
  });

  it("SHOULD answer the split OR the ordinary row WHEN the API says dissolved", async () => {
    spies.patch.mockResolvedValueOnce(response);
    expect(
      (await updateSplit({ id: "split-1", parts: createParams.parts })).result
        ?.split.id,
    ).toBe("split-1");

    spies.patch.mockResolvedValueOnce({
      dissolved: true,
      item: { ...part, splitId: undefined, splitPosition: undefined },
      lookups: { categories: {}, tags: {} },
    });
    const dissolved = await updateSplit({
      id: "split-1",
      parts: [createParams.parts[0]],
    });

    expect(dissolved.dissolved?.id).toBe("row-1");
    expect(dissolved.result).toBeUndefined();
  });

  it("SHOULD map SPLIT_ROW_USE_SPLIT AND a 404", async () => {
    spies.patch.mockRejectedValueOnce(
      new ApiBusinessError("SPLIT_ROW_USE_SPLIT", 422),
    );
    await expect(updateSplit({ id: "x", paid: true })).rejects.toBeInstanceOf(
      SplitRowUseSplit,
    );
    spies.patch.mockRejectedValueOnce(new ApiBusinessError("Not found", 404));
    await expect(updateSplit({ id: "x", paid: true })).rejects.toBeInstanceOf(
      FinancialNotFound,
    );
  });
});

describe("getSplit and deleteSplit", () => {
  it("SHOULD GET the split by id AND DELETE it", async () => {
    spies.get.mockResolvedValue(response);
    spies.delete.mockResolvedValue(undefined);

    expect((await getSplit("split-1")).split.description).toBe("Mercado");
    await deleteSplit("split-1");

    expect(spies.get).toHaveBeenCalledWith("/v1/finance/splits/split-1");
    expect(spies.delete).toHaveBeenCalledWith("/v1/finance/splits/split-1");
  });

  it("SHOULD map a failure to a business error", async () => {
    spies.get.mockRejectedValue(new ApiBusinessError("Not found", 404));
    spies.delete.mockRejectedValue(
      new ApiBusinessError("SPLIT_ROW_USE_SPLIT", 422),
    );

    await expect(getSplit("x")).rejects.toBeInstanceOf(FinancialNotFound);
    await expect(deleteSplit("x")).rejects.toBeInstanceOf(SplitRowUseSplit);
  });
});
