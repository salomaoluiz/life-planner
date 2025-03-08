import { setup, spies } from "./mocks/sets.mocks";
import StorageKeys from "./types";

it("SHOULD set string", async () => {
  await setup.setString(StorageKeys.string.FALLBACK_LANGUAGE, "en-US");

  expect(spies.setItem).toHaveBeenCalledTimes(1);
  expect(spies.setItem).toHaveBeenCalledWith(
    StorageKeys.string.FALLBACK_LANGUAGE,
    "en-US",
  );
});
