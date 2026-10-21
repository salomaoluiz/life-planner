import { GenericError } from "@domain/entities/errors";
import Repositories from "@domain/repositories";

import getBalanceSeriesUseCase from "./getBalanceSeriesUseCase";
import getDashboardSummaryUseCase from "./getDashboardSummaryUseCase";
import getFinanceTotalsUseCase from "./getFinanceTotalsUseCase";

const dashboard = {
  getBalanceSeries: jest.fn(),
  getSummary: jest.fn(),
  getTotals: jest.fn(),
};
const repositories = {
  financialRepository: { dashboard },
} as unknown as Repositories;
const params = {
  currency: "BRL",
  filter: {},
  from: "2025-11-01",
  ownerIds: ["o1"],
  to: "2026-10-31",
};

beforeEach(() => jest.clearAllMocks());

it.each([
  [
    getDashboardSummaryUseCase,
    dashboard.getSummary,
    "financial.get_dashboard_summary_use_case",
  ],
  [
    getBalanceSeriesUseCase,
    dashboard.getBalanceSeries,
    "financial.get_balance_series_use_case",
  ],
  [
    getFinanceTotalsUseCase,
    dashboard.getTotals,
    "financial.get_finance_totals_use_case",
  ],
])(
  "SHOULD call the repository AND expose its unique name",
  async (factory, method, name) => {
    method.mockResolvedValueOnce({ ok: true });
    const useCase = factory(repositories);

    expect(await useCase.execute(params as never)).toEqual({ ok: true });
    expect(method).toHaveBeenCalledWith(params);
    expect(useCase.uniqueName).toBe(name);
  },
);

it("SHOULD add the use case to the context of a known error AND re-throw", async () => {
  const error = new GenericError();

  dashboard.getSummary.mockRejectedValueOnce(error);
  const spy = jest.spyOn(error, "addContext");

  await expect(
    getDashboardSummaryUseCase(repositories).execute(params),
  ).rejects.toBe(error);
  expect(spy).toHaveBeenCalledWith({
    useCase: "financial.getDashboardSummaryUseCase",
  });

  const unknown = new Error("boom");

  dashboard.getSummary.mockRejectedValueOnce(unknown);
  await expect(
    getDashboardSummaryUseCase(repositories).execute(params),
  ).rejects.toBe(unknown);
});
