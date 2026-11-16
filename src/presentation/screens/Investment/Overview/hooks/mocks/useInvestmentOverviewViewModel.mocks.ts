import { router } from "expo-router";

import { renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { InvestmentsDashboard } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import { resetInvestmentOwnerFilter } from "@screens/Investment/hooks/useInvestmentOwnerFilter";

import useInvestmentOverviewViewModel from "../useInvestmentOverviewViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentsDashboardUseCase: {
      execute: jest.fn(),
      uniqueName: "dashboard",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "family-2",
    name: "Old Family",
    type: OwnerType.FAMILY,
  }),
];

function dashboard(
  overrides: Partial<InvestmentsDashboard> = {},
): InvestmentsDashboard {
  return {
    allocation: [],
    incomes: [],
    period: { bucket: "MONTH", from: "2025-12-01", to: "2026-11-04" },
    ranking: [
      {
        assetClass: "BR_STOCK",
        assetId: "a1",
        currency: "BRL",
        name: "Itausa PN",
        openResult: 0,
        openResultPercent: null,
        share: 1,
        ticker: "ITSA4",
        value: 100_000,
        valueKind: "QUOTE",
      },
    ],
    series: [{ date: "2026-11-04", invested: 100_000, marketValue: 100_000 }],
    summary: {
      assetsWithoutValue: 0,
      currentValue: 100_000,
      historyStartsAt: null,
      incomePlanned: 0,
      incomeReceived: 0,
      invested: 100_000,
      openResult: 0,
      openResultPercent: null,
      operationsWithoutFxRate: 0,
      realizedResult: 0,
      salesCount: 0,
      staleQuotes: 0,
    },
    ...overrides,
  } as InvestmentsDashboard;
}

const queries = {
  dashboard: new UseQueryFixture<InvestmentsDashboard>(),
  owners: new UseQueryFixture<OwnerDTO[]>(),
};
const spies = {
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};

function bind() {
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) =>
    (props.cacheKey[0] === "investment"
      ? queries.dashboard
      : queries.owners
    ).build()) as never);
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 4, 12, 0, 0) });
  Object.values(queries).forEach((query) => query.reset());
  queries.owners.withData(owners);
  queries.dashboard.withData(dashboard());
  resetInvestmentOwnerFilter();
  bind();
});
afterEach(() => jest.useRealTimers());

function dashboardQuery() {
  const calls = spies.useQuery.mock.calls.filter(
    ([props]) => (props as { cacheKey: string[] }).cacheKey[0] === "investment",
  );

  return calls[calls.length - 1][0] as unknown as {
    cacheKey: string[];
    enabled?: boolean;
    fetch: () => Promise<unknown>;
  };
}

function given(data: InvestmentsDashboard) {
  queries.dashboard.withData(data);
  bind();
}

function setup() {
  return renderHook(() => useInvestmentOverviewViewModel());
}

export {
  dashboard,
  dashboardQuery,
  given,
  owners,
  queries,
  setup,
  spies,
  useCases,
};
