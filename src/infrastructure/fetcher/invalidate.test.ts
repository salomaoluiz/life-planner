import { queryClient } from "@infrastructure/fetcher/reactQuery";

import invalidateFetcherData from "./invalidate";

it("SHOULD invalidate all queries so mounted screens refetch", async () => {
  const spy = jest.spyOn(queryClient, "invalidateQueries").mockResolvedValue();

  await invalidateFetcherData();

  expect(spy).toHaveBeenCalledTimes(1);
  expect(spy).toHaveBeenCalledWith();
});
