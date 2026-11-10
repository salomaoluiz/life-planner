import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";

import investmentRepositoryImpl from "./investmentRepositoryImpl";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD forward every method to the datasource and return its result", async () => {
  const repository = investmentRepositoryImpl(datasourcesMocks);
  const datasource = jest.mocked(datasourcesMocks.investmentDatasource);
  const results: [keyof typeof datasource, unknown[]][] = [
    ["createAsset", [{ name: "x" }]],
    ["createOperation", [{ assetId: "a" }]],
    ["deleteAsset", ["a"]],
    ["deleteOperation", ["o"]],
    ["deleteValuation", ["v"]],
    ["getAsset", ["a"]],
    ["getAssets", [{ status: InvestmentAssetStatus.ACTIVE }]],
    ["getOperationLink", ["tx"]],
    ["updateAsset", [{ id: "a" }]],
    ["updateOperation", [{ id: "o" }]],
    ["upsertValuation", [{ assetId: "a" }]],
  ];

  for (const [method, args] of results) {
    (datasource[method] as jest.Mock).mockResolvedValue(`${method}-result`);

    const call = repository[method] as (
      ...params: unknown[]
    ) => Promise<unknown>;

    expect(await call(...args)).toBe(`${method}-result`);
    expect(datasource[method]).toHaveBeenCalledWith(...args);
  }
});
