import { mocks, setup, spies } from "./mocks/gets.mocks";
import StorageKeys from "./types";

it("SHOULD get string", async () => {
  spies.getItem.mockResolvedValue(mocks.getItemResponse);

  const result = await setup.getString(StorageKeys.string.FALLBACK_LANGUAGE);

  expect(spies.getItem).toHaveBeenCalledTimes(1);
  expect(spies.getItem).toHaveBeenCalledWith(
    StorageKeys.string.FALLBACK_LANGUAGE,
  );
  expect(result).toEqual(mocks.getItemResponse);
});
