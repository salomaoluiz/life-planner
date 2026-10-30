import { render, screen } from "@tests";

import ToneDot from "./";

it("SHOULD label the dot for screen readers", () => {
  render(<ToneDot accessibilityLabel="Expense" tone="expense" />);
  expect(screen.getByLabelText("Expense")).toBeTruthy();
});

it("SHOULD use another color for another tone", () => {
  const expense = render(<ToneDot tone="expense" />).toJSON();
  const income = render(<ToneDot tone="income" />).toJSON();

  expect(income).not.toEqual(expense);
});
