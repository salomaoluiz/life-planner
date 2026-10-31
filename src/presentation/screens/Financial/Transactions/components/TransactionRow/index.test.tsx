import { fireEvent, render, screen } from "@tests";

import { AmountText } from "@components";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { categories, makeTransactionDTO } from "../../mocks/index.mocks";
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

describe("recurring series (spec 034)", () => {
  function recurring(overrides = {}) {
    return new TransactionUIModel(
      makeTransactionDTO({
        description: "Rent",
        id: "tx-r",
        occurrenceCount: 10,
        occurrenceNumber: 3,
        recurrenceFrequency: "MONTHLY",
        recurrenceId: "series-1",
        ...overrides,
      }),
    );
  }

  it("SHOULD show the repeat icon AND the counter WHEN the series has an end date", () => {
    render(<TransactionRow item={recurring()} onPress={jest.fn()} />);

    expect(screen.getByText("Rent 3/10")).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.rowRecurring),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(transactionsTestIds.rowRepeat)).toBeOnTheScreen();
    expect(screen.queryByTestId(transactionsTestIds.row)).toBeNull();
  });

  it("SHOULD show the frequency in the subtitle AND no counter WHEN the series has no end date", () => {
    render(
      <TransactionRow
        item={recurring({ occurrenceCount: undefined })}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText("Rent")).toBeOnTheScreen();
    expect(
      screen.getByText(/financial.recurrence.frequency.MONTHLY/),
    ).toBeOnTheScreen();
  });

  it("SHOULD keep the pay button AND the overdue badge on a real recurring row", () => {
    render(
      <TransactionRow
        item={recurring({
          date: new Date(2020, 0, 1).toISOString(),
          paid: false,
        })}
        onPay={jest.fn()}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId(transactionsTestIds.rowPay)).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.rowOverdue),
    ).toBeOnTheScreen();
  });

  it("SHOULD mark a projected row, hide the pay button AND open it through onProjectedPress", () => {
    const onPress = jest.fn();
    const onProjectedPress = jest.fn();
    const item = recurring({ isProjected: true, paid: false });

    render(
      <TransactionRow
        item={item}
        onPay={jest.fn()}
        onPress={onPress}
        onProjectedPress={onProjectedPress}
      />,
    );

    expect(
      screen.getByTestId(transactionsTestIds.rowProjected),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionsTestIds.rowProjectedBadge),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId(transactionsTestIds.rowPay)).toBeNull();

    fireEvent.press(screen.getByTestId(transactionsTestIds.rowProjected));

    expect(onProjectedPress).toHaveBeenCalledWith(item);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("SHOULD fall back to onPress WHEN a projected row has no projected handler", () => {
    const onPress = jest.fn();

    render(
      <TransactionRow
        item={recurring({ isProjected: true })}
        onPress={onPress}
      />,
    );
    fireEvent.press(screen.getByTestId(transactionsTestIds.rowProjected));

    expect(onPress).toHaveBeenCalledWith("tx-r");
  });
});

it("SHOULD format the amount with the currency of the transaction (spec 040)", () => {
  const usd = new TransactionUIModel(
    makeTransactionDTO({ currency: "USD", value: "12.50" }),
  );

  render(<TransactionRow item={usd} onPress={jest.fn()} />);

  expect(screen.UNSAFE_getByType(AmountText).props.currency).toBe("USD");
});

describe("notes (spec 059)", () => {
  it("SHOULD show the note icon only WHEN the transaction has a note, and still open it on press", () => {
    const onPress = jest.fn();
    const noted = new TransactionUIModel(
      makeTransactionDTO({ id: "tx-9", notes: "Casa → Aeroporto" }),
    );

    render(<TransactionRow item={noted} onPress={onPress} />);

    expect(
      screen.getByTestId(transactionsTestIds.rowNoteIcon),
    ).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(transactionsTestIds.row));
    expect(onPress).toHaveBeenCalledWith("tx-9");
  });

  it("SHOULD NOT show the icon WHEN there is no note", () => {
    setup();

    expect(screen.queryByTestId(transactionsTestIds.rowNoteIcon)).toBeNull();
  });
});

describe("pending rows (spec 061)", () => {
  const dto = makeTransactionDTO({ value: "12.50" });

  function renderPending(state: "deleting" | "saving") {
    const onPress = jest.fn();

    render(
      <TransactionRow
        item={new TransactionUIModel(dto, categories[0], state)}
        onPress={onPress}
      />,
    );

    return onPress;
  }

  it("SHOULD show the chip AND ignore a tap WHILE saving", () => {
    const onPress = renderPending("saving");

    expect(screen.getByTestId(transactionsTestIds.pendingChip)).toBeTruthy();
    expect(
      screen.getByText("financial.transactions.pending.saving"),
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId(transactionsTestIds.row));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("SHOULD show Deleting AND ignore a tap WHILE deleting", () => {
    const onPress = renderPending("deleting");

    expect(
      screen.getByText("financial.transactions.pending.deleting"),
    ).toBeTruthy();
    fireEvent.press(screen.getByTestId(transactionsTestIds.row));
    expect(onPress).not.toHaveBeenCalled();
  });
});
