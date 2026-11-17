import { renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useMarketIndexes from "./useMarketIndexes";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getInvestmentMarketIndexesUseCase: {
      execute: jest.fn(),
      uniqueName: "indexes",
    },
  },
}));

it("SHOULD read the indexes with the shared key AND honor `enabled`", async () => {
  const query = new UseQueryFixture();

  jest.mocked(useQuery).mockImplementation((() => query.build()) as never);
  renderHook(() => useMarketIndexes(false));

  const props = jest.mocked(useQuery).mock.calls[0][0];

  expect(props.cacheKey).toEqual(["investment", "market-indexes"]);
  expect(props.enabled).toBe(false);
  await props.fetch();
  expect(
    useCases.getInvestmentMarketIndexesUseCase.execute,
  ).toHaveBeenCalledWith();
});
