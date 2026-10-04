import { queryClient } from "@infrastructure/fetcher/reactQuery";

import resetFetcherData from "./reset";

it("SHOULD reset all queries", async () => {
  const spy = jest.spyOn(queryClient, "resetQueries").mockResolvedValue();

  await resetFetcherData();

  expect(spy).toHaveBeenCalledTimes(1);
});
