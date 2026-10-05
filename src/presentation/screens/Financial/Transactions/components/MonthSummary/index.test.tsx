import { fireEvent, screen } from "@tests";

import { AmountText } from "@components";

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
