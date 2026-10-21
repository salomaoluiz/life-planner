import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import { resetOverviewFilters } from "../useOverviewFilters";
import useOverviewViewModel from "../useOverviewViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialBalanceSeriesUseCase: {
      execute: jest.fn(),
      uniqueName: "balance",
    },
    getFinancialDashboardSummaryUseCase: {
      execute: jest.fn(),
      uniqueName: "summary",
    },
    getFinancialTotalsUseCase: { execute: jest.fn(), uniqueName: "totals" },
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

const queries = {
  balance: new UseQueryFixture<unknown>(),
  CATEGORY: new UseQueryFixture<unknown>(),
  owners: new UseQueryFixture<OwnerDTO[]>(),
  PERIOD: new UseQueryFixture<unknown>(),
  summary: new UseQueryFixture<unknown>(),
  TAG: new UseQueryFixture<unknown>(),
};

const spies = {
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};

type Key = keyof typeof queries;

function bind() {
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) =>
    queries[keyOf(props.cacheKey)].build()) as never);
}

function keyOf(cacheKey: string[]): Key {
  return (cacheKey[0] === "totals" ? cacheKey[1] : cacheKey[0]) as Key;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 20, 12, 0, 0) });
  spies.isFocused.mockReturnValue(false);
  Object.values(queries).forEach((query) => query.reset());
  queries.owners.withData(owners);
  resetOverviewFilters();
  bind();
});
afterEach(() => jest.useRealTimers());

function given(key: Key, data: unknown) {
  queries[key].withData(data as never);
  bind();
}

function queryProps(key: Key) {
  const calls = spies.useQuery.mock.calls.filter(
    ([props]) => keyOf((props as { cacheKey: string[] }).cacheKey) === key,
  );

  return calls[calls.length - 1][0] as unknown as {
    cacheKey: string[];
    enabled?: boolean;
    fetch: () => Promise<unknown>;
  };
}

function setup() {
  return renderHook(() => useOverviewViewModel());
}

export { given, owners, queries, queryProps, setup, spies, useCases };
