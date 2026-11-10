import { invalidateFetcherData } from "@infrastructure/fetcher";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";

import invalidateInvestments from "./invalidateInvestments";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Financial/hooks/invalidateFinanceData");

it("SHOULD invalidate the investment queries AND the finance data", async () => {
  await invalidateInvestments();

  expect(invalidateFetcherData).toHaveBeenCalledWith(["investment"]);
  expect(invalidateFinanceData).toHaveBeenCalledTimes(1);
});
