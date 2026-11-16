import { InvestmentIncomeType } from "@domain/entities/investment/enums";

import { averageReceived, incomeUnit, toIncomeGroups } from "./incomeModel";

const byType = {
  [InvestmentIncomeType.DIVIDEND]: 0,
  [InvestmentIncomeType.INTEREST]: 0,
  [InvestmentIncomeType.JCP]: 0,
  [InvestmentIncomeType.OTHER]: 0,
  [InvestmentIncomeType.YIELD]: 0,
};
const incomes = [
  { byType, date: "2026-09-30", planned: 0, received: 100_000 },
  { byType, date: "2026-10-31", planned: 0, received: 50_000 },
  { byType, date: "2026-11-30", planned: 41_000, received: 0 },
];

it("SHOULD put the received income in the solid part AND the planned one in the dashed part", () => {
  const groups = toIncomeGroups(incomes, "MONTH", "pt-BR");

  expect(groups.map((group) => group.income)).toEqual([
    { projected: 0, realized: 100_000 },
    { projected: 0, realized: 50_000 },
    { projected: 41_000, realized: 0 },
  ]);
  expect(groups.map((group) => group.label)).toEqual(["set", "out", "nov"]);
  expect(groups[0].expense).toEqual({ projected: 0, realized: 0 });
});

it("SHOULD average only what was received, over every bucket", () => {
  expect(averageReceived(incomes)).toBe(50_000);
});

it("SHOULD give no average for a single bucket", () => {
  expect(averageReceived(incomes.slice(0, 1))).toBeUndefined();
  expect(averageReceived([])).toBeUndefined();
});

it("SHOULD read income by week for days, weeks AND by month above", () => {
  expect(incomeUnit("DAY")).toBe("week");
  expect(incomeUnit("WEEK")).toBe("week");
  expect(incomeUnit("MONTH")).toBe("month");
});
