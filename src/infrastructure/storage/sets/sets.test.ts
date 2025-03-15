import { CacheStringKeys } from "@infrastructure/cache/types";

import StorageKeys from "../types";
import { setup, spies } from "./mocks/sets.mocks";

it("SHOULD set string", () => {
  setup.setString(StorageKeys.string.FALLBACK_LANGUAGE, "en-US");

  expect(spies.setItem).toHaveBeenCalledTimes(1);
  expect(spies.setItem).toHaveBeenCalledWith(
    StorageKeys.string.FALLBACK_LANGUAGE,
    "en-US",
  );
});

it("SHOULD set cache object", () => {
  setup.setCacheObject(CacheStringKeys.CACHE_USER_DATA, {
    id: "1",
    name: "John Doe",
  });

  expect(spies.setItem).toHaveBeenCalledTimes(1);
  expect(spies.setItem).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_USER_DATA,
    JSON.stringify({
      id: "1",
      name: "John Doe",
    }),
  );
});
