import { listQueryKey } from "./queryKeys";

it("SHOULD return a key different from the raw use-case key", () => {
  expect(listQueryKey("categories")).toEqual(["categories", "list"]);
  expect(listQueryKey("categories")).not.toEqual(["categories"]);
});
