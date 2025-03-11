import { setup, spies } from "./mocks/setTag.mocks";

it("SHOULD set tag", () => {
  setup("key", "tag");

  expect(spies.setTag).toHaveBeenCalledTimes(1);
  expect(spies.setTag).toHaveBeenCalledWith("key", "tag");
});
