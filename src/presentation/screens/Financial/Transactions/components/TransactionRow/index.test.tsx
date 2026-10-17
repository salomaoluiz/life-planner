import { fireEvent, render, screen } from "@tests";

import { AmountText } from "@components";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makeTransactionDTO } from "../../mocks/index.mocks";
import TransactionUIModel from "../../models/TransactionUIModel";
import TransactionRow from "./index";
import { setup } from "./mocks/index.mocks";

it("SHOULD render description, subtitle and the signed amount", () => {
  const { item } = setup();

  expect(screen.getByText("Groceries")).toBeOnTheScreen();
  expect(screen.getByText(item.subtitle)).toBeOnTheScreen();
  const amount = screen.UNSAFE_getByType(AmountText);
  expect(amount.props.value).toBe(1250);
  expect(amount.props.type).toBe("EXPENSE");
});

it("SHOULD call onPress with the id WHEN pressed", () => {
  const { onPress } = setup();

  fireEvent.press(screen.getByTestId(transactionsTestIds.row));

  expect(onPress).toHaveBeenCalledWith("tx-1");
});

it("SHOULD show the translated adjustment label AND its own testID for a balance adjustment", () => {
  const onPress = jest.fn();
  const adjustment = new TransactionUIModel(
    makeTransactionDTO({
      description: "Balance adjustment",
      excludeFromTotals: true,
      id: "adj-1",
      systemKey: "BALANCE_ADJUSTMENT",
      type: "INCOME",
      value: "50.00",
    }),
  );

  render(<TransactionRow item={adjustment} onPress={onPress} />);

  expect(
    screen.getByTestId(transactionsTestIds.adjustmentRow),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.adjustment"),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(transactionsTestIds.row)).toBeNull();
  fireEvent.press(screen.getByTestId(transactionsTestIds.adjustmentRow));
  expect(onPress).toHaveBeenCalledWith("adj-1");
});

describe("paid status (spec 033)", () => {
  function unpaid(date: Date) {
    return new TransactionUIModel(
      makeTransactionDTO({ date: date.toISOString(), paid: false }),
    );
  }

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 9, 15, 12));
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it("SHOULD show the overdue badge AND the pay button for an unpaid past row, and call onPay", () => {
    const onPay = jest.fn();
    const item = unpaid(new Date(2026, 9, 10));

    render(<TransactionRow item={item} onPay={onPay} onPress={jest.fn()} />);

    expect(
      screen.getByTestId(transactionsTestIds.rowOverdue),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(transactionsTestIds.rowPay));
    expect(onPay).toHaveBeenCalledWith(item);
  });

  it("SHOULD show the pay button WITHOUT the badge for an unpaid future row", () => {
    render(
      <TransactionRow
        item={unpaid(new Date(2026, 9, 20))}
        onPay={jest.fn()}
        onPress={jest.fn()}
      />,
    );

    expect(screen.queryByTestId(transactionsTestIds.rowOverdue)).toBeNull();
    expect(screen.getByTestId(transactionsTestIds.rowPay)).toBeOnTheScreen();
  });

  it("SHOULD NOT call onPay again WHILE the row is paying", () => {
    const onPay = jest.fn();

    render(
      <TransactionRow
        isPaying
        item={unpaid(new Date(2026, 9, 20))}
        onPay={onPay}
        onPress={jest.fn()}
      />,
    );
    fireEvent.press(screen.getByTestId(transactionsTestIds.rowPay));

    expect(onPay).not.toHaveBeenCalled();
  });

  it("SHOULD show neither WHEN the row is paid", () => {
    render(
      <TransactionRow
        item={new TransactionUIModel(makeTransactionDTO({ paid: true }))}
        onPay={jest.fn()}
        onPress={jest.fn()}
      />,
    );

    expect(screen.queryByTestId(transactionsTestIds.rowPay)).toBeNull();
    expect(screen.queryByTestId(transactionsTestIds.rowOverdue)).toBeNull();
  });
});
