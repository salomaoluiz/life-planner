import { setup, spies } from "./mocks/setContext.mocks";

it("SHOULD set context", () => {
  setup("key", { value: "value" });

  expect(spies.setContext).toHaveBeenCalledTimes(1);
  expect(spies.setContext).toHaveBeenCalledWith("key", { value: "value" });
});
