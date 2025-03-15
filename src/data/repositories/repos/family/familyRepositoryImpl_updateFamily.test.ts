import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyRepositoryImpl_updateFamily.mocks";

it("SHOULD update family", async () => {
  await setup();

  expect(spies.updateFamily).toHaveBeenCalledTimes(1);
  expect(spies.updateFamily).toHaveBeenCalledWith({
    id: mocks.defaultProps.id,
    name: mocks.defaultProps.name,
  });
});

it("SHOULD invalidate cache", async () => {
  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
});
