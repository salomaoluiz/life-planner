import { activityKeys } from "./activityKeys";

it("SHOULD keep every key under the activity root", () => {
  expect(activityKeys.all()).toEqual(["activity"]);
  expect(activityKeys.list("f")).toEqual(["activity", "list", "f"]);
  expect(activityKeys.items("id", "q")).toEqual([
    "activity",
    "items",
    "id",
    "q",
  ]);
});
