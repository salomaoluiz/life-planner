import {
  ApiBusinessError,
  FieldInvalid,
  InvestmentFractionAlreadySold,
  InvestmentFractionBreaks,
  InvestmentNegativePosition,
  InvestmentNoPosition,
} from "@domain/entities/errors";
import {
  InvestmentFeeKind,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import { api } from "@infrastructure/api";

import investmentApi from "./index";

jest.mock("@infrastructure/api", () => ({
  api: {
    delete: jest.fn(),
    get: jest.fn(),
    patch: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
  },
}));

const apiPosition = {
  averagePrice: "10.11409524",
  cost: 318594,
  pendingFractions: [
    { cost: 506, date: "2026-03-10", eventId: "event-1", quantity: "0.5" },
  ],
  quantity: "315",
  realizedResult: 0,
};
const apiEvent = {
  averagePriceAfter: "10.11409524",
  averagePriceBefore: "1.01141046",
  costRemoved: null,
  date: "2026-03-10",
  fees: [],
  fractionCost: 506,
  fractionQuantity: "0.5",
  id: "event-1",
  quantityAfter: "315",
  quantityBefore: "3155",
  ratioFrom: "10",
  ratioTo: "1",
  realizedResult: null,
  type: "REVERSE_SPLIT",
};
const apiSuggestion = {
  assetId: "asset-1",
  averagePriceAfter: "9.61109827",
  bonusPercent: "10",
  bonusUnitCost: "4.50",
  currency: "BRL",
  date: "2026-11-18",
  fractionQuantity: "0.5",
  id: "sug-1",
  quantityAfter: "346",
  quantityBefore: "315",
  ticker: "MGLU3",
  type: "BONUS",
};

function businessError(status: number, message: string, body = {}) {
  return new ApiBusinessError(message, status, {}, body);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("events", () => {
  it("SHOULD create a reverse split with normalized decimals AND map the event with its position", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValue({ item: apiEvent, position: apiPosition });

    const result = await investmentApi.createEvent({
      assetId: "asset-1",
      date: "2026-03-10",
      ratioFrom: "10",
      ratioTo: "1,0",
      type: InvestmentOperationType.REVERSE_SPLIT,
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-1/operations",
      expect.objectContaining({
        date: "2026-03-10",
        ratioFrom: "10",
        ratioTo: "1",
        type: "REVERSE_SPLIT",
      }),
    );
    expect(result.operation).toMatchObject({
      id: "event-1",
      quantity: "0",
      total: 0,
      type: "REVERSE_SPLIT",
      unitPrice: "0",
    });
    expect(result.operation.corporateEvent).toEqual({
      averagePriceAfter: "10.11409524",
      averagePriceBefore: "1.01141046",
      bonusPercent: undefined,
      bonusUnitCost: undefined,
      fractionCost: 506,
      fractionQuantity: "0.5",
      quantityAfter: "315",
      quantityBefore: "3155",
      ratioFrom: "10",
      ratioTo: "1",
    });
    expect(result.position.pendingFractions).toEqual([
      { cost: 506, date: "2026-03-10", eventId: "event-1", quantity: "0.5" },
    ]);
  });

  it("SHOULD send a bonus with its percent AND an empty cost per share as null", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValue({ item: apiEvent, position: apiPosition });

    await investmentApi.createEvent({
      assetId: "asset-1",
      bonusPercent: "10",
      bonusUnitCost: "4,5",
      date: "2026-11-18",
      type: InvestmentOperationType.BONUS,
    });
    await investmentApi.approveEventSuggestion({
      bonusUnitCost: " ",
      id: "sug-1",
    });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/assets/asset-1/operations",
      expect.objectContaining({ bonusPercent: "10", bonusUnitCost: "4.5" }),
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/v1/investments/event-suggestions/sug-1/approve",
      expect.objectContaining({ bonusUnitCost: null }),
    );
  });

  it("SHOULD refuse a ratio or a percent that is not above zero BEFORE any call", async () => {
    await expect(
      investmentApi.createEvent({
        assetId: "a",
        date: "2026-03-10",
        ratioFrom: "0",
        ratioTo: "2",
        type: InvestmentOperationType.SPLIT,
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.createEvent({
        assetId: "a",
        bonusPercent: "abc",
        date: "2026-03-10",
        type: InvestmentOperationType.BONUS,
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.createEvent({
        assetId: "a",
        bonusPercent: "10",
        bonusUnitCost: "x",
        date: "2026-03-10",
        type: InvestmentOperationType.BONUS,
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("SHOULD patch an event AND a fraction sale through the operation route", async () => {
    jest
      .mocked(api.patch)
      .mockResolvedValue({ item: apiEvent, position: apiPosition });

    await investmentApi.updateOperation({
      bonusUnitCost: null,
      id: "event-1",
      ratioFrom: "20",
    });
    await investmentApi.updateOperation({
      grossAmount: 600,
      id: "sale-1",
    });

    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/operations/event-1",
      expect.objectContaining({ bonusUnitCost: null, ratioFrom: "20" }),
    );
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      "/v1/investments/operations/sale-1",
      expect.objectContaining({ grossAmount: 600 }),
    );
  });
});

describe("fraction sale", () => {
  it("SHOULD sell the fraction with the account only WHEN it generates a finance entry", async () => {
    jest.mocked(api.post).mockResolvedValue({
      item: { ...apiEvent, fractionOfOperationId: "event-1", type: "SELL" },
      position: apiPosition,
    });

    await investmentApi.createFractionSale({
      accountId: "acc-1",
      date: "2026-04-04",
      eventId: "event-1",
      fees: [{ amount: 20, kind: InvestmentFeeKind.BROKERAGE }],
      generateTransaction: true,
      grossAmount: 520,
    });
    await investmentApi.createFractionSale({
      accountId: "acc-1",
      date: "2026-04-04",
      eventId: "event-1",
      fees: [],
      generateTransaction: false,
      grossAmount: 0,
    });

    expect(api.post).toHaveBeenNthCalledWith(
      1,
      "/v1/investments/operations/event-1/fraction-sale",
      {
        accountId: "acc-1",
        date: "2026-04-04",
        fees: [{ amount: 20, description: undefined, kind: "BROKERAGE" }],
        generateTransaction: true,
        grossAmount: 520,
      },
    );
    expect(api.post).toHaveBeenNthCalledWith(
      2,
      "/v1/investments/operations/event-1/fraction-sale",
      expect.objectContaining({
        accountId: undefined,
        generateTransaction: false,
        grossAmount: 0,
      }),
    );
  });

  it("SHOULD map the sale link of the operation", async () => {
    jest.mocked(api.post).mockResolvedValue({
      item: { ...apiEvent, fractionOfOperationId: "event-1", type: "SELL" },
      position: apiPosition,
    });

    const result = await investmentApi.createFractionSale({
      date: "2026-04-04",
      eventId: "event-1",
      fees: [],
      generateTransaction: false,
      grossAmount: 520,
    });

    expect(result.operation.fractionOfOperationId).toBe("event-1");
  });
});

describe("event suggestions", () => {
  it("SHOULD list the suggestions of an asset AND map them", async () => {
    jest.mocked(api.get).mockResolvedValue({
      count: 1,
      items: [apiSuggestion],
      nextCursor: null,
    });

    const [suggestion] = await investmentApi.getEventSuggestions({
      assetId: "asset-1",
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/event-suggestions?assetId=asset-1",
    );
    expect(suggestion).toMatchObject({
      averagePriceAfter: "9.61109827",
      bonusPercent: "10",
      bonusUnitCost: "4.50",
      fractionQuantity: "0.5",
      quantityAfter: "346",
      ticker: "MGLU3",
      type: "BONUS",
    });
    expect(suggestion.averagePriceBefore).toBeUndefined();
  });

  it("SHOULD list every readable asset WHEN no asset is given", async () => {
    jest.mocked(api.get).mockResolvedValue({ items: [] });

    expect(await investmentApi.getEventSuggestions({})).toEqual([]);
    expect(api.get).toHaveBeenCalledWith("/v1/investments/event-suggestions");
  });

  it("SHOULD approve AND reject", async () => {
    jest
      .mocked(api.post)
      .mockResolvedValue({ item: apiEvent, position: apiPosition });

    await investmentApi.approveEventSuggestion({
      bonusPercent: "5",
      date: "2026-11-17",
      id: "sug-1",
      type: InvestmentOperationType.BONUS,
    });
    await investmentApi.rejectEventSuggestion("sug-1");

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/event-suggestions/sug-1/approve",
      expect.objectContaining({
        bonusPercent: "5",
        date: "2026-11-17",
        type: "BONUS",
      }),
    );
    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/event-suggestions/sug-1/reject",
      {},
    );
  });
});

describe("errors", () => {
  it("SHOULD map the 422 and 409 answers of the event rules", async () => {
    const cases: [ApiBusinessError, unknown][] = [
      [
        businessError(422, "There is no position on 2026-03-10"),
        InvestmentNoPosition,
      ],
      [
        businessError(
          422,
          "This change would make the position negative on 2026-04-01",
        ),
        InvestmentNegativePosition,
      ],
      [
        businessError(
          422,
          "This change removes the fraction sold on 2026-04-04. Delete the fraction sale first.",
        ),
        InvestmentFractionBreaks,
      ],
      [
        businessError(409, "The fraction of this event was already sold", {
          code: "FRACTION_ALREADY_SOLD",
        }),
        InvestmentFractionAlreadySold,
      ],
    ];

    for (const [error, expected] of cases) {
      jest.mocked(api.post).mockRejectedValue(error);

      await expect(
        investmentApi.createEvent({
          assetId: "a",
          date: "2026-03-10",
          ratioFrom: "1",
          ratioTo: "2",
          type: InvestmentOperationType.SPLIT,
        }),
      ).rejects.toBeInstanceOf(expected as typeof Error);
    }
  });

  it("SHOULD keep the date of the position errors", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(
        businessError(422, "There is no position on 2026-03-10"),
      );

    await expect(
      investmentApi.createEvent({
        assetId: "a",
        date: "2026-03-10",
        ratioFrom: "1",
        ratioTo: "2",
        type: InvestmentOperationType.SPLIT,
      }),
    ).rejects.toMatchObject({ date: "2026-03-10" });
  });
});
