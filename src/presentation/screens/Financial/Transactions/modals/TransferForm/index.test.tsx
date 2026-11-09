import {
  defaultViewModel,
  fireEvent,
  noop,
  onSwitchType,
  screen,
  setup,
} from "./mocks/index.mocks";
import { createInitialState } from "./models/transferFormState";
import transferFormTestIds from "./testIds";

it("SHOULD show the create title, the fields of one currency AND the save buttons", () => {
  setup();

  expect(screen.getByText("financial.transfers.form.title")).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.description)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.from)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.to)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.amountOut)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.dateOut)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.dateIn)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.fee)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.paid)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.saveButton)).toBeOnTheScreen();
  expect(
    screen.getByTestId(transferFormTestIds.saveAndNewButton),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(transferFormTestIds.rateMode)).toBeNull();
  expect(screen.queryByTestId(transferFormTestIds.deleteButton)).toBeNull();
});

it("SHOULD call the handlers of the buttons", () => {
  const onSave = jest.fn();
  const onSaveAndNew = jest.fn();
  const onAccountSwap = jest.fn();

  setup({ onAccountSwap, onSave, onSaveAndNew });

  fireEvent.press(screen.getByTestId(transferFormTestIds.saveButton));
  fireEvent.press(screen.getByTestId(transferFormTestIds.saveAndNewButton));
  fireEvent.press(screen.getByTestId(transferFormTestIds.swap));

  expect(onSave).toHaveBeenCalled();
  expect(onSaveAndNew).toHaveBeenCalled();
  expect(onAccountSwap).toHaveBeenCalled();
});

it("SHOULD show the amount in and the rate WHEN the currencies differ", () => {
  setup({
    currencyIn: "USD",
    rate: { base: "IN", value: 5.4348 },
    state: {
      ...createInitialState(new Date(2026, 10, 4)),
      amountInCents: 92000,
      amountOutCents: 500000,
      toAccountId: "a3",
    },
  });

  expect(screen.getByTestId(transferFormTestIds.rateMode)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.amountIn)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.rateText)).toBeOnTheScreen();
});

it("SHOULD show the rate field AND the computed amount in the rate mode", () => {
  setup({
    currencyIn: "USD",
    state: {
      ...createInitialState(new Date(2026, 10, 4)),
      rateMode: "RATE",
      rateText: "5,4348",
      toAccountId: "a3",
    },
  });

  expect(screen.getByTestId(transferFormTestIds.rate)).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.amountIn)).toBeOnTheScreen();
});

it("SHOULD show how many days the money arrives later WHEN the dates differ AND use the same date on press", () => {
  const onSameDate = jest.fn();

  setup({ daysLater: 2, onSameDate });

  fireEvent.press(screen.getByTestId(transferFormTestIds.sameDate));

  expect(onSameDate).toHaveBeenCalled();
});

it("SHOULD show the edit title, the delete button AND the scope of a series occurrence", () => {
  setup({ canSaveAndNew: false, isEditing: true, isRecurring: true });

  expect(
    screen.getByText("financial.transfers.form.editTitle"),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transferFormTestIds.deleteButton),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.scope)).toBeOnTheScreen();
  expect(screen.queryByTestId(transferFormTestIds.saveAndNewButton)).toBeNull();
  expect(screen.queryByTestId(transferFormTestIds.repeat)).toBeNull();
});

it("SHOULD show the series fields WHEN repeat is on", () => {
  setup({
    state: { ...createInitialState(new Date(2026, 10, 4)), repeatOn: true },
  });

  expect(
    screen.getByTestId(transferFormTestIds.repeatFrequency),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(transferFormTestIds.repeatEnd)).toBeOnTheScreen();
});

it("SHOULD show the form error AND the field errors", () => {
  setup({
    errorKey: "financial.errors.transferSameAccount",
    errors: { amountOut: "financial.transfers.form.errors.amount" },
  });

  expect(screen.getByTestId(transferFormTestIds.formError)).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transfers.form.errors.amount"),
  ).toBeOnTheScreen();
});

it("SHOULD go back to the transaction form WHEN Despesa or Receita is picked", () => {
  setup();

  fireEvent.press(screen.getByText("financial.common.expense"));
  fireEvent.press(screen.getByText("financial.common.income"));
  fireEvent.press(screen.getByText("financial.transfers.type"));

  expect(onSwitchType).toHaveBeenNthCalledWith(1, "EXPENSE");
  expect(onSwitchType).toHaveBeenNthCalledWith(2, "INCOME");
  expect(onSwitchType).toHaveBeenCalledTimes(2);
});

it("SHOULD render nothing but the sheet WHILE loading", () => {
  setup({ isLoading: true, state: undefined });

  expect(screen.getByTestId(transferFormTestIds.sheet)).toBeOnTheScreen();
  expect(screen.queryByTestId(transferFormTestIds.description)).toBeNull();
});

it("SHOULD disable saving WHILE a request runs", () => {
  setup({ isBlocking: true });

  expect(screen.getByTestId(transferFormTestIds.saveButton)).toBeDisabled();
  expect(defaultViewModel.onClose).toBe(noop);
});
