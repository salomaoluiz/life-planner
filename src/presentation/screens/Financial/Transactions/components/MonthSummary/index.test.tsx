import { fireEvent, screen } from "@tests";

import { AmountText, MetricBlock } from "@components";

import { setup } from "./mocks/index.mocks";

it("SHOULD render balance, income and expense amounts", () => {
  setup();

  const values = screen
    .UNSAFE_getAllByType(AmountText)
    .map((n) => n.props.value);
  expect(values).toEqual([1000, 3000, 2000]);
  expect(screen.getByText("Balance")).toBeOnTheScreen();
  expect(screen.getByText("Incomes")).toBeOnTheScreen();
  expect(screen.getByText("Expenses")).toBeOnTheScreen();
});

it("SHOULD render a skeleton card WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.queryByText("Balance")).not.toBeOnTheScreen();
  expect(screen.queryByText("Try again")).not.toBeOnTheScreen();
});

it("SHOULD render an inline retry WHEN errored", () => {
  const { onRetry } = setup({ isError: true });

  expect(screen.getByText("boom")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("Try again"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show a negative balance as an EXPENSE of its absolute value", () => {
  setup({ balanceCents: -500 });

  const balance = screen.UNSAFE_getAllByType(AmountText)[0];
  expect(balance.props.type).toBe("EXPENSE");
  expect(balance.props.value).toBe(500);
  expect(balance.props.size).toBe("heading");
});

it("SHOULD show a positive balance without type", () => {
  setup();

  expect(screen.UNSAFE_getAllByType(AmountText)[0].props.type).toBeUndefined();
});

it("SHOULD show the scope caption under the balance", () => {
  setup({ scopeLabel: "Test Family", scopeTestID: "scope-id" });

  expect(screen.getByText("Test Family")).toBeOnTheScreen();
  expect(screen.getByTestId("scope-id")).toBeOnTheScreen();
});

it("SHOULD give the income and expense amounts their own test ids", () => {
  setup({ expenseTestID: "expense-id", incomeTestID: "income-id" });

  expect(screen.getByTestId("income-id")).toBeOnTheScreen();
  expect(screen.getByTestId("expense-id")).toBeOnTheScreen();
});

it("SHOULD NOT render nested metric boxes", () => {
  setup();

  expect(screen.UNSAFE_queryAllByType(MetricBlock)).toHaveLength(0);
});

it("SHOULD render the to receive and to pay amounts WHEN their labels are given (spec 033)", () => {
  setup({
    toPayCents: 700,
    toPayLabel: "To pay",
    toReceiveCents: 900,
    toReceiveLabel: "To receive",
  });

  const values = screen
    .UNSAFE_getAllByType(AmountText)
    .map((n) => n.props.value);
  expect(values).toEqual([1000, 3000, 900, 2000, 700]);
  expect(screen.getByText("To pay")).toBeOnTheScreen();
  expect(screen.getByText("To receive")).toBeOnTheScreen();
});

describe("projected line (spec 034 FR 15)", () => {
  it("SHOULD show the projected income and expense of a future month", () => {
    setup({
      projectedExpenseCents: 12000,
      projectedIncomeCents: 5000,
      projectedLabel: "Projected",
      projectedTestID: "projected-line",
    });

    expect(screen.getByTestId("projected-line")).toBeOnTheScreen();
    expect(screen.getByText("Projected")).toBeOnTheScreen();
    const values = screen
      .UNSAFE_getAllByType(AmountText)
      .map((n) => n.props.value);
    expect(values).toEqual(expect.arrayContaining([5000, 12000]));
  });

  it("SHOULD show only the side that has a projection", () => {
    setup({
      projectedExpenseCents: 0,
      projectedIncomeCents: 5000,
      projectedLabel: "Projected",
      projectedTestID: "projected-line",
    });

    const values = screen
      .UNSAFE_getAllByType(AmountText)
      .map((n) => n.props.value);
    expect(values).toEqual(expect.arrayContaining([5000]));
    expect(values).not.toContain(0);
  });

  it("SHOULD hide the line WHEN nothing is projected (current and past months)", () => {
    setup({
      projectedExpenseCents: 0,
      projectedIncomeCents: 0,
      projectedLabel: "Projected",
      projectedTestID: "projected-line",
    });

    expect(screen.queryByTestId("projected-line")).toBeNull();
  });
});

describe("favorite | total table (spec 094.2)", () => {
  function values(overrides = {}) {
    return {
      balanceCents: 88000,
      expenseCents: 812000,
      incomeCents: 900000,
      projectedExpenseCents: 0,
      projectedIncomeCents: 0,
      toPayCents: 530000,
      toReceiveCents: 450000,
      ...overrides,
    };
  }
  const labels = {
    expenses: "Expenses",
    income: "Incomes",
    projected: "Projected",
    result: "Result",
    toPay: "To pay",
    toReceive: "To receive",
  };
  const favorite = {
    emphasis: "primary" as const,
    key: "favorite",
    label: "Main",
    values: values(),
  };
  const total = {
    emphasis: "muted" as const,
    key: "total",
    label: "Total",
    values: values({ balanceCents: 142000 }),
  };

  function table(props = {}) {
    return setup({
      columns: [favorite, total],
      rowA11yLabel: (label, parts) => `${label}: ${parts.join(" | ")}`,
      tableLabels: labels,
      tableTestID: "table",
      ...props,
    });
  }

  it("SHOULD render both column headers and every row", () => {
    table();

    expect(screen.getByText("Main")).toBeOnTheScreen();
    expect(screen.getByText("Total")).toBeOnTheScreen();
    ["Result", "Incomes", "To receive", "Expenses", "To pay"].forEach((label) =>
      expect(screen.getByText(label)).toBeOnTheScreen(),
    );
    expect(screen.getByTestId("table-favorite-balanceCents")).toBeOnTheScreen();
    expect(screen.getByTestId("table-total-balanceCents")).toBeOnTheScreen();
  });

  it("SHOULD render ONE value per row WHEN there is a single column", () => {
    table({ columns: [favorite] });

    expect(screen.queryByText("Total")).not.toBeOnTheScreen();
    expect(screen.queryByTestId("table-total-balanceCents")).toBeNull();
  });

  it("SHOULD show a negative result as an EXPENSE of its absolute value", () => {
    table({
      columns: [{ ...favorite, values: values({ balanceCents: -60000 }) }],
    });

    const result = screen
      .UNSAFE_getAllByType(AmountText)
      .find((node) => node.props.testID === "table-favorite-balanceCents");
    expect(result?.props.type).toBe("EXPENSE");
    expect(result?.props.value).toBe(60000);
  });

  it("SHOULD show the Projected row only WHEN a column has projected values", () => {
    table();
    expect(screen.queryByText("Projected")).not.toBeOnTheScreen();
  });

  it("SHOULD show the Projected row WHEN the series add something", () => {
    table({
      columns: [
        { ...favorite, values: values({ projectedIncomeCents: 450000 }) },
        total,
      ],
    });
    expect(screen.getByText("Projected")).toBeOnTheScreen();
  });

  it("SHOULD give every row one accessible label", () => {
    table();

    expect(screen.getByLabelText(/^Result: /)).toBeOnTheScreen();
    expect(screen.getByLabelText(/^To pay: /)).toBeOnTheScreen();
  });

  it("SHOULD keep the single-figure card WHEN there are no columns", () => {
    setup({ columns: undefined });

    expect(screen.getByText("Balance")).toBeOnTheScreen();
    expect(screen.queryByText("Result")).not.toBeOnTheScreen();
  });

  it("SHOULD still render the skeleton WHEN loading with columns", () => {
    table({ isLoading: true });

    expect(screen.queryByText("Main")).not.toBeOnTheScreen();
  });
});
