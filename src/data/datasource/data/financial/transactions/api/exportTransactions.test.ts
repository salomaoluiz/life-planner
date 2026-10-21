import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import exportTransactions from "./exportTransactions";
import getExportCount from "./getExportCount";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), getText: jest.fn() },
}));

const query = {
  accountIds: ["a1"],
  creditCardIds: ["c1", "c2"],
  from: "2026-01-01",
  owner: "FAMILY" as const,
  ownerId: "f1",
  to: "2026-12-31",
};

beforeEach(() => jest.clearAllMocks());

describe("getExportCount", () => {
  it("SHOULD send the period, the scope and the repeated ids, and return the count", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({ count: 12 });

    expect(await getExportCount(query)).toBe(12);

    const url = jest.mocked(api.get).mock.calls[0][0];
    const params = new URLSearchParams(url.split("?")[1]);

    expect(url.startsWith("/v1/finance/transactions/export/count?")).toBe(true);
    expect(params.get("from")).toBe("2026-01-01");
    expect(params.get("to")).toBe("2026-12-31");
    expect(params.get("owner")).toBe("FAMILY");
    expect(params.get("ownerId")).toBe("f1");
    expect(params.getAll("accountId")).toEqual(["a1"]);
    expect(params.getAll("creditCardId")).toEqual(["c1", "c2"]);
  });

  it("SHOULD not send an ownerId for ALL or USER", async () => {
    jest.mocked(api.get).mockResolvedValueOnce({ count: 0 });

    await getExportCount({ ...query, owner: "ALL" });

    expect(jest.mocked(api.get).mock.calls[0][0]).not.toContain("ownerId");
  });

  it("SHOULD wrap an unknown failure in a GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    await expect(getExportCount(query)).rejects.toBeInstanceOf(GenericError);
  });
});

describe("exportTransactions", () => {
  it("SHOULD add the format and language and return the text with the API filename", async () => {
    jest
      .mocked(api.getText)
      .mockResolvedValueOnce({ filename: "transacoes-x.csv", text: "a;b" });

    const file = await exportTransactions({
      ...query,
      format: "BR",
      lang: "pt-BR",
    });

    const params = new URLSearchParams(
      jest.mocked(api.getText).mock.calls[0][0].split("?")[1],
    );

    expect(file).toEqual({ csv: "a;b", filename: "transacoes-x.csv" });
    expect(params.get("format")).toBe("BR");
    expect(params.get("lang")).toBe("pt-BR");
  });

  it("SHOULD name the file itself WHEN the API sends no filename", async () => {
    jest
      .mocked(api.getText)
      .mockResolvedValueOnce({ filename: undefined, text: "a" });

    const file = await exportTransactions({
      ...query,
      format: "INTL",
      lang: "en-US",
    });

    expect(file.filename).toBe("transactions-2026-01-01_2026-12-31.csv");
  });

  it("SHOULD map a 400 to a business error", async () => {
    jest
      .mocked(api.getText)
      .mockRejectedValueOnce(new ApiBusinessError("Bad", 400, {}, {}));

    await expect(
      exportTransactions({ ...query, format: "BR", lang: "pt-BR" }),
    ).rejects.toThrow();
  });
});
