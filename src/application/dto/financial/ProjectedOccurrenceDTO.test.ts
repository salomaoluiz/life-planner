import ProjectedOccurrenceModel from "@data/models/financial/ProjectedOccurrenceModel";

import ProjectedOccurrenceDTO from "./ProjectedOccurrenceDTO";

const json = {
  account: { id: "acc-1", name: "Broker" },
  assetId: "asset-1",
  category: { id: "cat-1", name: "Yields" },
  creditCard: null,
  currency: "BRL",
  date: "2026-12-15",
  description: "HGLG11",
  frequency: { interval: 1, unit: "MONTH" },
  investmentIncomeSeriesId: "series-1",
  occurrenceNumber: 24,
  owner: "USER",
  ownerId: "owner-1",
  recurrenceId: "series-1",
  tags: [],
  type: "INCOME",
  value: 13200,
};

it("SHOULD keep the series and the asset of a projected investment income from the API to the row (spec 115)", () => {
  const model = ProjectedOccurrenceModel.fromJSON(json);
  const dto = ProjectedOccurrenceDTO.fromEntity(model as never);
  const row = dto.toTransactionDTO();

  expect(model).toMatchObject({
    assetId: "asset-1",
    investmentIncomeSeriesId: "series-1",
  });
  expect(row).toMatchObject({
    externalLock: "INVESTMENT",
    investmentAssetId: "asset-1",
    isProjected: true,
  });
});

it("SHOULD not mark an ordinary projected series as an investment income", () => {
  const row = ProjectedOccurrenceDTO.fromEntity(
    ProjectedOccurrenceModel.fromJSON({
      ...json,
      assetId: undefined,
      investmentIncomeSeriesId: undefined,
    }) as never,
  ).toTransactionDTO();

  expect(row.externalLock).toBeUndefined();
  expect(row.investmentAssetId).toBeUndefined();
});
