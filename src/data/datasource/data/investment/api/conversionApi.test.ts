import {
  ApiBusinessError,
  FieldInvalid,
  InvestmentArchivedDestination,
  InvestmentConversionChainLocked,
  InvestmentConversionLaterOperations,
  InvestmentConvertedOrigin,
  InvestmentNoPosition,
  InvestmentUseConversionRoute,
} from "@domain/entities/errors";
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
  averagePrice: null,
  cost: 0,
  currentUnitPrice: null,
  currentValue: null,
  currentValueDate: null,
  openResult: null,
  openResultPercent: null,
  pendingFractions: [],
  quantity: "0",
  realizedResult: 0,
};
const apiConversion = {
  date: "2026-10-15",
  from: {
    assetId: "from-1",
    cost: 808550,
    operationId: "out-1",
    quantity: "103",
    ticker: "BCFF11",
  },
  id: "conv-1",
  locked: false,
  ratioFrom: "1",
  ratioTo: "7.4",
  to: {
    assetId: "to-1",
    cost: 808550,
    fractionCost: 212,
    fractionQuantity: "0.2",
    operationId: "in-1",
    quantity: "762",
    ticker: "BTHF11",
  },
};
const written = {
  fromPosition: apiPosition,
  item: apiConversion,
  toPosition: apiPosition,
};

function businessError(status: number, message: string, body = {}) {
  return new ApiBusinessError(message, status, {}, body);
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("conversions (spec 112)", () => {
  it("SHOULD convert into an existing asset with normalized ratios AND map the result", async () => {
    jest.mocked(api.post).mockResolvedValue(written);

    const result = await investmentApi.createConversion({
      assetId: "from-1",
      date: "2026-10-15",
      destination: { assetId: "to-1" },
      generateTransaction: false,
      ratioFrom: "1",
      ratioTo: "7,4",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/from-1/conversions",
      expect.objectContaining({
        accountId: undefined,
        destination: { assetId: "to-1" },
        generateTransaction: false,
        ratioFrom: "1",
        ratioTo: "7.4",
      }),
    );
    expect(result.conversion).toMatchObject({
      id: "conv-1",
      locked: false,
      to: { fractionQuantity: "0.2", quantity: "762" },
    });
    expect(result.toPosition.pendingFractions).toEqual([]);
  });

  it("SHOULD send a new destination upper-cased with the cash part AND the account", async () => {
    jest.mocked(api.post).mockResolvedValue(written);

    await investmentApi.createConversion({
      accountId: "acc-1",
      assetId: "from-1",
      cashAmount: 1500,
      cashReferenceUnitValue: "10,40",
      date: "2026-10-15",
      destination: { newAsset: { name: "Fundo Exemplo", ticker: " xpto11 " } },
      generateTransaction: true,
      ratioFrom: "1",
      ratioTo: "1",
    });

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/from-1/conversions",
      expect.objectContaining({
        accountId: "acc-1",
        cashAmount: 1500,
        cashReferenceUnitValue: "10.4",
        destination: { newAsset: { name: "Fundo Exemplo", ticker: "XPTO11" } },
      }),
    );
  });

  it("SHOULD refuse a ratio or a reference value that is not above zero BEFORE any call", async () => {
    await expect(
      investmentApi.createConversion({
        assetId: "from-1",
        date: "2026-10-15",
        destination: { assetId: "to-1" },
        generateTransaction: false,
        ratioFrom: "0",
        ratioTo: "1",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.updateConversion({ id: "conv-1", ratioTo: "abc" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    await expect(
      investmentApi.updateConversion({
        cashReferenceUnitValue: "-1",
        id: "conv-1",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
    expect(api.patch).not.toHaveBeenCalled();
  });

  it("SHOULD read, patch AND delete a conversion", async () => {
    jest.mocked(api.get).mockResolvedValue({ item: apiConversion });
    jest.mocked(api.patch).mockResolvedValue(written);

    expect((await investmentApi.getConversion("conv-1")).from.ticker).toBe(
      "BCFF11",
    );
    expect(api.get).toHaveBeenCalledWith("/v1/investments/conversions/conv-1");

    const patched = await investmentApi.updateConversion({
      cashAmount: null,
      id: "conv-1",
      ratioTo: "2",
    });

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/investments/conversions/conv-1",
      expect.objectContaining({ cashAmount: null, ratioTo: "2" }),
    );
    expect(patched.conversion.id).toBe("conv-1");

    await investmentApi.deleteConversion("conv-1");
    expect(api.delete).toHaveBeenCalledWith(
      "/v1/investments/conversions/conv-1",
    );
  });

  it("SHOULD map the 422 answers of the conversion rules", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(
        businessError(
          422,
          "Delete the conversion from BTHF11 on 2026-11-20 first.",
          { code: "CONVERSION_CHAIN_LOCKED" },
        ),
      )
      .mockRejectedValueOnce(
        businessError(
          422,
          "BCFF11 has operations after 2026-10-15. Delete them or pick another date.",
          {
            details: {
              date: "2026-10-15",
              operations: [
                { date: "2026-11-01", id: "b", type: "SELL" },
                { date: "2026-10-20", id: "a", type: "BUY" },
              ],
            },
          },
        ),
      )
      .mockRejectedValueOnce(
        businessError(422, "There is no position on 2026-10-15"),
      )
      .mockRejectedValueOnce(
        businessError(422, "Archived assets can't receive a conversion"),
      );
    const params = {
      assetId: "from-1",
      date: "2026-10-15",
      destination: { assetId: "to-1" },
      generateTransaction: false,
      ratioFrom: "1",
      ratioTo: "1",
    };

    await expect(investmentApi.createConversion(params)).rejects.toMatchObject({
      date: "2026-11-20",
      ticker: "BTHF11",
    });
    await expect(investmentApi.createConversion(params)).rejects.toMatchObject({
      date: "2026-10-15",
      dates: ["2026-10-20", "2026-11-01"],
      ticker: "BCFF11",
    });
    await expect(investmentApi.createConversion(params)).rejects.toBeInstanceOf(
      InvestmentNoPosition,
    );
    await expect(investmentApi.createConversion(params)).rejects.toBeInstanceOf(
      InvestmentArchivedDestination,
    );
  });

  it("SHOULD map the route and reactivation refusals", async () => {
    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(
        businessError(422, "Edit the conversion instead.", {
          code: "USE_CONVERSION_ROUTE",
        }),
      )
      .mockRejectedValueOnce(
        businessError(
          422,
          "This asset was converted into BTHF11. Delete the conversion to reactivate it.",
        ),
      );

    await expect(
      investmentApi.updateConversion({ id: "conv-1" }),
    ).rejects.toBeInstanceOf(InvestmentUseConversionRoute);
    await expect(
      investmentApi.updateConversion({ id: "conv-1" }),
    ).rejects.toMatchObject({ ticker: "BTHF11" });
    expect(InvestmentConvertedOrigin).toBeDefined();
    expect(InvestmentConversionChainLocked).toBeDefined();
    expect(InvestmentConversionLaterOperations).toBeDefined();
  });

  it("SHOULD read the conversion links of an asset AND the conversion of an operation", async () => {
    jest.mocked(api.get).mockResolvedValue({
      item: {
        convertedFrom: [
          {
            assetId: "from-1",
            conversionId: "conv-1",
            date: "2026-10-15",
            ticker: "BCFF11",
          },
        ],
        currency: "BRL",
        id: "to-1",
        operations: [
          {
            conversion: {
              assetId: "from-1",
              conversionId: "conv-1",
              locked: true,
              ratioFrom: "1",
              ratioTo: "7.4",
              ticker: "BCFF11",
            },
            conversionCost: 808550,
            costRemoved: null,
            date: "2026-10-15",
            fees: [],
            id: "in-1",
            quantity: "762",
            realizedResult: null,
            type: "CONVERSION_IN",
          },
        ],
        position: apiPosition,
        valuations: [],
      },
    });

    const detail = await investmentApi.getAsset("to-1");

    expect(detail.convertedFrom).toEqual([
      {
        assetId: "from-1",
        conversionId: "conv-1",
        date: "2026-10-15",
        ticker: "BCFF11",
      },
    ]);
    expect(detail.convertedTo).toBeNull();
    expect(detail.operations[0]).toMatchObject({
      conversion: { locked: true, ratioTo: "7.4", ticker: "BCFF11" },
      conversionCost: 808550,
      type: "CONVERSION_IN",
    });
  });
});
