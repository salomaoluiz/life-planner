import {
  AccountArchived,
  ApiBusinessError,
  FamilyArchived,
  FieldInvalid,
  FinancialNotFound,
  GenericError,
  InvestmentAccountNotChangeable,
  InvestmentArchived,
  InvestmentClassLocked,
  InvestmentFeesAboveSale,
  InvestmentNegativePosition,
  InvestmentRowUseOperation,
  TickerExists,
} from "@domain/entities/errors";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
  InvestmentFeeKind,
  InvestmentOperationType,
} from "@domain/entities/investment/enums";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
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

// region mocks
const position = {
  averagePrice: "9.82200000",
  cost: 1178640,
  currentUnitPrice: "10.53",
  currentValue: 1263600,
  currentValueDate: "2026-11-01",
  openResult: 84960,
  openResultPercent: 0.0721,
  quantity: "1200",
  realizedResult: 31790,
};
const apiAsset = {
  archivedAt: null,
  assetClass: "BR_STOCK",
  currency: "BRL",
  id: "asset-1",
  name: "Itausa PN",
  operationCount: 4,
  owner: "USER",
  ownerId: "owner-1",
  position,
  status: "ACTIVE",
  ticker: "ITSA4",
};
const apiOperation = {
  accountId: "acc-1",
  costRemoved: null,
  date: "2026-06-10",
  fees: [{ amount: 490, description: null, id: "f1", kind: "BROKERAGE" }],
  feesTotal: 490,
  generateTransaction: true,
  gross: 510000,
  id: "op-1",
  quantity: "500",
  realizedResult: null,
  total: 510490,
  transactionId: "tx-1",
  type: "BUY",
  unitPrice: "10.2",
};
const apiValuation = {
  date: "2026-11-01",
  id: "val-1",
  source: "MANUAL",
  unitPrice: "10.53",
};
// endregion mocks

beforeEach(() => {
  jest.resetAllMocks();
});

function apiError(statusCode: number, message: string) {
  return new ApiBusinessError(message, statusCode);
}

describe("reads", () => {
  it("SHOULD list the assets of a status AND map them", async () => {
    jest.mocked(api.get).mockResolvedValue({ items: [apiAsset] });

    const [asset] = await investmentApi.getAssets({
      status: InvestmentAssetStatus.ARCHIVED,
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/investments/assets?status=ARCHIVED",
    );
    expect(asset).toMatchObject({
      assetClass: InvestmentAssetClass.BR_STOCK,
      currency: "BRL",
      operationCount: 4,
      ticker: "ITSA4",
    });
    expect(asset.position.currentValue).toBe(1263600);
  });

  it("SHOULD read the detail with operations and valuations", async () => {
    jest.mocked(api.get).mockResolvedValue({
      item: {
        ...apiAsset,
        operations: [apiOperation],
        valuations: [apiValuation],
      },
    });

    const detail = await investmentApi.getAsset("asset-1");

    expect(api.get).toHaveBeenCalledWith("/v1/investments/assets/asset-1");
    expect(detail.operations[0]).toMatchObject({
      fees: [{ amount: 490, kind: InvestmentFeeKind.BROKERAGE }],
      quantity: "500",
      transactionId: "tx-1",
    });
    expect(detail.valuations[0].unitPrice).toBe("10.53");
  });

  it("SHOULD fill defaults for a sparse payload", async () => {
    jest.mocked(api.get).mockResolvedValue({
      item: {
        id: "a",
        position: {},
        ticker: undefined,
      },
    });

    const detail = await investmentApi.getAsset("a");

    expect(detail).toMatchObject({
      archivedAt: null,
      currency: "BRL",
      operationCount: 0,
      operations: [],
      position: { cost: 0, quantity: "0", realizedResult: 0 },
      ticker: null,
      valuations: [],
    });
  });

  it("SHOULD map a failed read to a generic error", async () => {
    jest.mocked(api.get).mockRejectedValue(new Error("boom"));

    await expect(
      investmentApi.getAssets({ status: InvestmentAssetStatus.ACTIVE }),
    ).rejects.toBeInstanceOf(GenericError);
    await expect(investmentApi.getAsset("a")).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});

describe("assets", () => {
  const createParams = {
    assetClass: InvestmentAssetClass.BR_STOCK,
    currentUnitPrice: "10,53",
    name: "Itausa PN",
    owner: OwnerType.USER,
    ownerId: "owner-1",
    ticker: "ITSA4",
  };

  it("SHOULD create with a normalized current unit price", async () => {
    jest.mocked(api.post).mockResolvedValue(apiAsset);

    const asset = await investmentApi.createAsset(createParams);

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets",
      expect.objectContaining({ currentUnitPrice: "10.53", ticker: "ITSA4" }),
    );
    expect(asset.id).toBe("asset-1");
  });

  it("SHOULD leave the optional price and ticker out WHEN empty", async () => {
    jest.mocked(api.post).mockResolvedValue(apiAsset);

    await investmentApi.createAsset({
      ...createParams,
      currentUnitPrice: "",
      ticker: "",
    });

    const body = jest.mocked(api.post).mock.calls[0][1] as Record<
      string,
      unknown
    >;
    expect(body.currentUnitPrice).toBeUndefined();
    expect(body.ticker).toBeUndefined();
  });

  it("SHOULD reject an invalid price BEFORE any call", async () => {
    await expect(
      investmentApi.createAsset({ ...createParams, currentUnitPrice: "0" }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("SHOULD map a duplicate ticker (409) to TickerExists", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(apiError(409, "You already have this ticker"));

    await expect(
      investmentApi.createAsset(createParams),
    ).rejects.toBeInstanceOf(TickerExists);
  });

  it("SHOULD update, archive and delete", async () => {
    jest.mocked(api.patch).mockResolvedValue(apiAsset);

    await investmentApi.updateAsset({
      id: "asset-1",
      status: InvestmentAssetStatus.ARCHIVED,
      ticker: null,
    });
    await investmentApi.deleteAsset("asset-1");

    expect(api.patch).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-1",
      expect.objectContaining({ status: "ARCHIVED", ticker: null }),
    );
    expect(api.delete).toHaveBeenCalledWith("/v1/investments/assets/asset-1");
  });

  it.each([
    [
      "Class and currency can't change after the first operation",
      InvestmentClassLocked,
    ],
    ["Family is archived", FamilyArchived],
  ])("SHOULD map the 422 %p", async (message, errorClass) => {
    jest.mocked(api.patch).mockRejectedValue(apiError(422, message));

    await expect(
      investmentApi.updateAsset({ id: "a", name: "x" }),
    ).rejects.toBeInstanceOf(errorClass);
  });

  it("SHOULD map 404 and unknown failures", async () => {
    jest.mocked(api.delete).mockRejectedValueOnce(apiError(404, "Not Found"));
    await expect(investmentApi.deleteAsset("a")).rejects.toBeInstanceOf(
      FinancialNotFound,
    );

    jest.mocked(api.delete).mockRejectedValueOnce(new Error("boom"));
    await expect(investmentApi.deleteAsset("a")).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});

describe("operations", () => {
  const params = {
    accountId: "acc-1",
    assetId: "asset-1",
    date: "2026-06-10",
    fees: [{ amount: 490, kind: InvestmentFeeKind.BROKERAGE }],
    generateTransaction: true,
    quantity: "500",
    type: InvestmentOperationType.BUY,
    unitPrice: "10,20",
  };

  it("SHOULD create with normalized decimals AND return the new position", async () => {
    jest.mocked(api.post).mockResolvedValue({ item: apiOperation, position });

    const result = await investmentApi.createOperation(params);

    expect(api.post).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-1/operations",
      expect.objectContaining({
        accountId: "acc-1",
        quantity: "500",
        unitPrice: "10.2",
      }),
    );
    expect(result.position.quantity).toBe("1200");
    expect(result.operation.id).toBe("op-1");
  });

  it("SHOULD NOT send an account WHEN no finance entry is generated", async () => {
    jest.mocked(api.post).mockResolvedValue({ item: apiOperation, position });

    await investmentApi.createOperation({
      ...params,
      generateTransaction: false,
    });

    const body = jest.mocked(api.post).mock.calls[0][1] as Record<
      string,
      unknown
    >;
    expect(body.accountId).toBeUndefined();
  });

  it.each([
    [{ quantity: "0" }],
    [{ quantity: "abc" }],
    [{ unitPrice: "1.123456789" }],
  ])("SHOULD reject %p BEFORE any call", async (override) => {
    await expect(
      investmentApi.createOperation({ ...params, ...override }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.post).not.toHaveBeenCalled();
  });

  it.each([
    [
      422,
      "This change would make the position negative on 2026-09-15",
      InvestmentNegativePosition,
    ],
    [
      422,
      "Archived assets can't change. Reactivate it first.",
      InvestmentArchived,
    ],
    [422, "Fees are higher than the sale value", InvestmentFeesAboveSale],
    [422, "Account is archived", AccountArchived],
    [422, "Account currency differs from the asset currency", FieldInvalid],
    [
      422,
      "Edit this transaction through its investment operation",
      InvestmentRowUseOperation,
    ],
    [
      403,
      "This operation uses an account you can't change",
      InvestmentAccountNotChangeable,
    ],
  ])("SHOULD map %p %p", async (status, message, errorClass) => {
    jest.mocked(api.patch).mockRejectedValue(apiError(status, message));

    await expect(
      investmentApi.updateOperation({ id: "op-1", quantity: "1" }),
    ).rejects.toBeInstanceOf(errorClass);
  });

  it("SHOULD carry the date of the negative position", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValue(
        apiError(
          422,
          "This change would make the position negative on 2026-09-15",
        ),
      );

    const error = await investmentApi
      .createOperation(params)
      .catch((caught: unknown) => caught);

    expect(error).toMatchObject({ date: "2026-09-15" });
  });

  it("SHOULD update only what changes AND delete", async () => {
    jest.mocked(api.patch).mockResolvedValue({ item: apiOperation, position });

    await investmentApi.updateOperation({
      accountId: null,
      fees: [],
      generateTransaction: false,
      id: "op-1",
      unitPrice: "11",
    });
    await investmentApi.deleteOperation("op-1");

    const body = jest.mocked(api.patch).mock.calls[0][1] as Record<
      string,
      unknown
    >;
    expect(body).toMatchObject({ accountId: null, fees: [], unitPrice: "11" });
    expect(body.quantity).toBeUndefined();
    expect(api.delete).toHaveBeenCalledWith("/v1/investments/operations/op-1");
  });

  it("SHOULD map a failed delete", async () => {
    jest.mocked(api.delete).mockRejectedValue(new Error("boom"));

    await expect(investmentApi.deleteOperation("op-1")).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});

describe("valuations", () => {
  it("SHOULD upsert by asset and date AND return the position", async () => {
    jest.mocked(api.put).mockResolvedValue({ item: apiValuation, position });

    const result = await investmentApi.upsertValuation({
      assetId: "asset-1",
      date: "2026-11-01",
      unitPrice: "10,61",
    });

    expect(api.put).toHaveBeenCalledWith(
      "/v1/investments/assets/asset-1/valuations/2026-11-01",
      { unitPrice: "10.61" },
    );
    expect(result.valuation.id).toBe("val-1");
    expect(result.position.currentValue).toBe(1263600);
  });

  it("SHOULD reject a zero price BEFORE any call AND map failures", async () => {
    await expect(
      investmentApi.upsertValuation({
        assetId: "a",
        date: "2026-11-01",
        unitPrice: "0",
      }),
    ).rejects.toBeInstanceOf(FieldInvalid);
    expect(api.put).not.toHaveBeenCalled();

    jest
      .mocked(api.put)
      .mockRejectedValue(
        apiError(422, "Archived assets can't change. Reactivate it first."),
      );
    await expect(
      investmentApi.upsertValuation({
        assetId: "a",
        date: "2026-11-01",
        unitPrice: "1",
      }),
    ).rejects.toBeInstanceOf(InvestmentArchived);
  });

  it("SHOULD delete by id AND map a failure", async () => {
    await investmentApi.deleteValuation("val-1");
    expect(api.delete).toHaveBeenCalledWith("/v1/investments/valuations/val-1");

    jest.mocked(api.delete).mockRejectedValue(new Error("boom"));
    await expect(investmentApi.deleteValuation("val-1")).rejects.toBeInstanceOf(
      GenericError,
    );
  });
});
