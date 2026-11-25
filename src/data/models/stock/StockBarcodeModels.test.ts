import { apiItemMock as stockJson } from "./mocks/StockModel.mocks";
import {
  AiUsageModel,
  ItemSuggestionModel,
  StockBarcodeLookupModel,
} from "./StockBarcodeModels";

describe("StockBarcodeLookupModel", () => {
  it("SHOULD read the matches with their owner and read-only flag", () => {
    const model = StockBarcodeLookupModel.fromJSON({
      code: "123",
      matches: [
        {
          item: stockJson,
          owner: "FAMILY",
          ownerId: "family-id",
          ownerName: "Casa",
          readOnly: true,
        },
      ],
    });

    expect(model.code).toBe("123");
    expect(model.matches[0]).toMatchObject({
      ownerName: "Casa",
      readOnly: true,
    });
    expect(model.matches[0].item.id).toBe(stockJson.id);
  });

  it("SHOULD read no matches", () => {
    expect(StockBarcodeLookupModel.fromJSON({ code: "1" }).matches).toEqual([]);
  });
});

describe("ItemSuggestionModel", () => {
  it("SHOULD read the fields, sources, notice and usage", () => {
    const model = ItemSuggestionModel.fromJSON({
      fields: { description: "Leite" },
      notice: "LIMIT_REACHED",
      sources: { description: "OPEN_FOOD_FACTS" },
      usage: {
        light: { limit: 50, used: 1 },
        search: { limit: 10, used: 10 },
      },
    });

    expect(model.fields).toEqual({ description: "Leite" });
    expect(model.notice).toBe("LIMIT_REACHED");
    expect(model.usage.search).toEqual({ limit: 10, used: 10 });
  });

  it("SHOULD read a null notice as none", () => {
    expect(
      ItemSuggestionModel.fromJSON({ fields: {}, notice: null }).notice,
    ).toBeUndefined();
  });
});

describe("AiUsageModel", () => {
  it("SHOULD default missing counters to zero", () => {
    expect(AiUsageModel.fromJSON({}).light).toEqual({ limit: 0, used: 0 });
  });
});
