import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";

import MonthSummaryUIModel from "./MonthSummaryUIModel";

const month = new Date(2026, 9, 15);

it("SHOULD expose a positive balance without a type", () => {
  const model = new MonthSummaryUIModel(
    new MonthSummaryDTO({ balance: 613840, expense: 36160, income: 650000 }),
    month,
    "en-US",
  );

  expect(model.balanceValue).toBe(613840);
  expect(model.balanceType).toBeUndefined();
  expect(model.income).toBe(650000);
  expect(model.expense).toBe(36160);
});

it("SHOULD expose a negative balance as an absolute EXPENSE", () => {
  const model = new MonthSummaryUIModel(
    new MonthSummaryDTO({ balance: -31290, expense: 31290, income: 0 }),
    month,
    "en-US",
  );

  expect(model.balanceValue).toBe(31290);
  expect(model.balanceType).toBe("EXPENSE");
});

it("SHOULD not type a zero balance", () => {
  const model = new MonthSummaryUIModel(
    new MonthSummaryDTO({ balance: 0, expense: 0, income: 0 }),
    month,
    "en-US",
  );

  expect(model.balanceType).toBeUndefined();
});

it("SHOULD name the month in the active locale", () => {
  const dto = new MonthSummaryDTO({ balance: 0, expense: 0, income: 0 });

  expect(new MonthSummaryUIModel(dto, month, "en-US").monthName).toBe(
    "October",
  );
  expect(new MonthSummaryUIModel(dto, month, "pt-BR").monthName).toBe(
    "outubro",
  );
});
