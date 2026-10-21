import { Datasources } from "@data/datasource";

import dashboardRepositoryImpl from "./dashboardRepositoryImpl";

const datasource = {
  getBalanceSeries: jest.fn().mockResolvedValue("series"),
  getSummary: jest.fn().mockResolvedValue("summary"),
  getTotals: jest.fn().mockResolvedValue("totals"),
};
const repository = dashboardRepositoryImpl({
  financialDashboardDatasource: datasource,
} as unknown as Datasources);
const params = {
  currency: "BRL",
  filter: {},
  from: "2025-11-01",
  ownerIds: [],
  to: "2026-10-31",
};

it("SHOULD forward every read to the datasource", async () => {
  expect(await repository.getSummary(params)).toBe("summary");
  expect(
    await repository.getBalanceSeries({ ...params, granularity: "MONTH" }),
  ).toBe("series");
  expect(await repository.getTotals({ ...params, groupBy: "PERIOD" })).toBe(
    "totals",
  );
  expect(datasource.getSummary).toHaveBeenCalledWith(params);
});
