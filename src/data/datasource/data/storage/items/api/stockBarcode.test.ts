import {
  StockBarcodeInUse,
  StockBarcodeInvalid,
} from "@domain/entities/errors";
import ApiBusinessError from "@domain/entities/errors/api/ApiBusinessError";
import { api } from "@infrastructure/api";

import {
  getAiUsage,
  lookupStockBarcode,
  suggestStockItem,
} from "./stockBarcode";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
}));

const apiGet = jest.mocked(api.get);
const apiPost = jest.mocked(api.post);

beforeEach(() => jest.clearAllMocks());

describe("lookupStockBarcode", () => {
  it("SHOULD read the code with the local day", async () => {
    apiGet.mockResolvedValue({ code: "123", matches: [] });

    const result = await lookupStockBarcode("123");

    expect(result.code).toBe("123");
    expect(apiGet).toHaveBeenCalledWith(
      expect.stringMatching(
        /^\/v1\/stock\/barcodes\/123\?today=\d{4}-\d{2}-\d{2}$/,
      ),
    );
  });

  it("SHOULD map a 400 about the barcode to StockBarcodeInvalid", async () => {
    apiGet.mockRejectedValue(new ApiBusinessError("Invalid barcode", 400));

    await expect(lookupStockBarcode("1")).rejects.toBeInstanceOf(
      StockBarcodeInvalid,
    );
  });
});

describe("suggestStockItem", () => {
  it("SHOULD post the barcode or the name with the owner", async () => {
    apiPost.mockResolvedValue({ fields: { description: "Leite" } });

    const result = await suggestStockItem({
      barcode: "123",
      owner: "USER",
      ownerId: "u",
    });

    expect(result.fields).toEqual({ description: "Leite" });
    expect(apiPost).toHaveBeenCalledWith("/v1/stock/item-suggestions", {
      barcode: "123",
      name: undefined,
      owner: "USER",
      ownerId: "u",
    });
  });

  it("SHOULD wrap an unknown failure in GenericError", async () => {
    apiPost.mockRejectedValue(new Error("boom"));

    await expect(
      suggestStockItem({ name: "abc", owner: "USER", ownerId: "u" }),
    ).rejects.toMatchObject({ name: "GenericError" });
  });

  it("SHOULD expose a BARCODE_IN_USE 409 as StockBarcodeInUse with the item", async () => {
    apiPost.mockRejectedValue(
      new ApiBusinessError(
        "Barcode already in use",
        409,
        {},
        { code: "BARCODE_IN_USE", description: "Leite", itemId: "item-1" },
      ),
    );

    const error = await suggestStockItem({
      barcode: "1",
      owner: "USER",
      ownerId: "u",
    }).catch((caught) => caught);

    expect(error).toBeInstanceOf(StockBarcodeInUse);
    expect(error).toMatchObject({ description: "Leite", itemId: "item-1" });
  });
});

describe("getAiUsage", () => {
  it("SHOULD read today's usage", async () => {
    apiGet.mockResolvedValue({
      light: { limit: 50, used: 1 },
      search: { limit: 10, used: 2 },
    });

    expect((await getAiUsage()).search.used).toBe(2);
  });
});
