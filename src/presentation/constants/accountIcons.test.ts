import { ACCOUNT_ICONS } from "./accountIcons";

it("SHOULD list the account icons in order", () => {
  expect(ACCOUNT_ICONS).toEqual([
    "bank",
    "wallet",
    "credit-card",
    "piggy-bank",
    "cash",
    "safe",
    "chart-line",
    "home",
    "briefcase",
    "cellphone",
  ]);
});
