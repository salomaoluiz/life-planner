import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import { InvestmentIncome } from "@domain/entities/investment/InvestmentEntities";

import { displayStatus, statusTone } from "./incomeInfo";

function income(overrides: Partial<InvestmentIncome>): InvestmentIncome {
  return {
    overdue: false,
    status: InvestmentIncomeStatus.PLANNED,
    ...overrides,
  } as never;
}

it("SHOULD show a received income as RECEIVED even when the date is old", () => {
  expect(
    displayStatus(
      income({ overdue: true, status: InvestmentIncomeStatus.RECEIVED }),
    ),
  ).toBe("RECEIVED");
});

it("SHOULD show a planned income as OVERDUE only after its payment date", () => {
  expect(displayStatus(income({ overdue: true }))).toBe("OVERDUE");
  expect(displayStatus(income({ overdue: false }))).toBe("PLANNED");
});

it("SHOULD color received as income, overdue as warning AND planned as neutral", () => {
  expect(statusTone("RECEIVED")).toBe("income");
  expect(statusTone("OVERDUE")).toBe("warning");
  expect(statusTone("PLANNED")).toBe("neutral");
});
