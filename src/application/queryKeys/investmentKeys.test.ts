import { investmentKeys } from "./investmentKeys";

it("SHOULD build every key under the investment root", () => {
  expect(investmentKeys.all()).toEqual(["investment"]);
  expect(investmentKeys.assets("ACTIVE")).toEqual([
    "investment",
    "assets",
    "ACTIVE",
  ]);
  expect(investmentKeys.asset("a1")).toEqual(["investment", "asset", "a1"]);
});
