import {
  AiUsageModel,
  ItemSuggestionModel,
  StockBarcodeLookupModel,
} from "@data/models/stock/StockBarcodeModels";

import { mocks, spies } from "./mocks/stock.mocks";
import {
  getAiUsage,
  lookupStockBarcode,
  suggestStockItem,
} from "./stockBarcode";

it("SHOULD map the matches to entities WITH the owner name and the read-only flag", async () => {
  spies.datasource.lookupStockBarcode.mockResolvedValue(
    new StockBarcodeLookupModel("123", [
      {
        item: mocks.listModel,
        owner: "FAMILY",
        ownerId: "f",
        ownerName: "Casa",
        readOnly: true,
      },
    ]),
  );

  const result = await lookupStockBarcode("123", mocks.datasources);

  expect(spies.datasource.lookupStockBarcode).toHaveBeenCalledWith("123");
  expect(result.matches[0]).toMatchObject({
    ownerName: "Casa",
    readOnly: true,
  });
  expect(result.matches[0].item.id).toBe(mocks.listModel.id);
});

it("SHOULD map the suggestion AND its notice and usage", async () => {
  const usage = new AiUsageModel(
    { limit: 50, used: 1 },
    { limit: 10, used: 10 },
  );

  spies.datasource.suggestStockItem.mockResolvedValue(
    new ItemSuggestionModel(
      { description: "Leite" },
      { description: "OPEN_FOOD_FACTS" },
      usage,
      "LIMIT_REACHED",
    ),
  );

  const result = await suggestStockItem(
    { barcode: "1", owner: "USER", ownerId: "u" },
    mocks.datasources,
  );

  expect(result).toEqual({
    fields: { description: "Leite" },
    notice: "LIMIT_REACHED",
    sources: { description: "OPEN_FOOD_FACTS" },
    usage: { light: usage.light, search: usage.search },
  });
});

it("SHOULD read the usage of today", async () => {
  spies.datasource.getAiUsage.mockResolvedValue(
    new AiUsageModel({ limit: 50, used: 3 }, { limit: 10, used: 0 }),
  );

  expect((await getAiUsage(mocks.datasources)).light.used).toBe(3);
});
