import { renderHook } from "@tests";

import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useOwners, { OWNERS_STALE_TIME } from "./index";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: { getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" } },
}));

beforeEach(() => {
  jest.mocked(useQuery).mockReturnValue(new UseQueryFixture().build() as never);
});

it("SHOULD use the shared owners cache key AND a 5 minute staleTime", () => {
  renderHook(() => useOwners());

  const options = jest.mocked(useQuery).mock.calls[0][0];

  expect(options.cacheKey).toEqual(["owners"]);
  expect(options.staleTime).toBe(5 * 60 * 1000);
  expect(OWNERS_STALE_TIME).toBe(5 * 60 * 1000);
});

it("SHOULD return the query", () => {
  const query = new UseQueryFixture().build();
  jest.mocked(useQuery).mockReturnValue(query as never);

  const { result } = renderHook(() => useOwners());

  expect(result.current).toBe(query);
});
