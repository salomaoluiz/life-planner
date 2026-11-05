import { fireEvent, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { defaultViewModel, setup } from "./mocks/index.mocks";

it("SHOULD title the sheet AND show the value, the date chips and the actions", () => {
  setup();

  expect(
    screen.getByText(
      'financial.transactions.confirmPay.titlePay {"description":"Conta de luz"}',
    ),
  ).toBeOnTheScreen();
  [
    transactionsTestIds.confirmPayValue,
    transactionsTestIds.confirmPayDateTransaction,
    transactionsTestIds.confirmPayDateToday,
    transactionsTestIds.confirmPayDateYesterday,
    transactionsTestIds.confirmPayDateOther,
    transactionsTestIds.confirmPaySubmit,
    transactionsTestIds.confirmPayCancel,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(
    screen.getByText(
      'financial.transactions.confirmPay.overdue_other {"count":7}',
    ),
  ).toBeOnTheScreen();
});

it("SHOULD use the receive copy for an income", () => {
  setup({ isIncome: true });

  expect(
    screen.getByText(
      'financial.transactions.confirmPay.titleReceive {"description":"Conta de luz"}',
    ),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.confirmPay.actionReceive"),
  ).toBeOnTheScreen();
});

it("SHOULD hide the duplicate chips AND the difference WHEN they do not apply", () => {
  setup({
    choices: ["transaction", "other"],
    differenceCents: 0,
    overdueDays: 0,
  });

  expect(
    screen.queryByTestId(transactionsTestIds.confirmPayDateToday),
  ).toBeNull();
  expect(
    screen.queryByTestId(transactionsTestIds.confirmPayDateYesterday),
  ).toBeNull();
  expect(
    screen.queryByText("financial.transactions.confirmPay.overdue", {
      exact: false,
    }),
  ).toBeNull();
});

it("SHOULD pick a chip, confirm and cancel", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(transactionsTestIds.confirmPayDateToday));
  expect(vm.onChoice).toHaveBeenCalledWith("today");

  fireEvent.press(screen.getByTestId(transactionsTestIds.confirmPaySubmit));
  expect(vm.onConfirm).toHaveBeenCalledTimes(1);

  fireEvent.press(screen.getByTestId(transactionsTestIds.confirmPayCancel));
  expect(vm.onClose).toHaveBeenCalledTimes(1);
});

it("SHOULD show the date picker field WHEN Other date is selected", () => {
  setup({ choice: "other", otherDate: new Date(2026, 10, 1) });

  expect(
    screen.getByTestId(transactionsTestIds.confirmPayDatePicker),
  ).toBeOnTheScreen();
});

it("SHOULD note the series WHEN the row is a recurring occurrence", () => {
  const vm = defaultViewModel;

  setup({
    item: Object.assign(
      Object.create(Object.getPrototypeOf(vm.item)),
      vm.item,
      { recurrenceFrequency: "MONTHLY", recurrenceId: "series-1" },
    ),
  });

  expect(
    screen.getByText("financial.transactions.confirmPay.seriesNote", {
      exact: false,
    }),
  ).toBeOnTheScreen();
});

it("SHOULD render nothing WHEN there is no item", () => {
  setup({ isReady: false, item: undefined });

  expect(screen.queryByTestId(transactionsTestIds.confirmPayModal)).toBeNull();
});
