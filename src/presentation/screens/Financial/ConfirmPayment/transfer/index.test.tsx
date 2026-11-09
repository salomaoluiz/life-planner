import { fireEvent, render, screen } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import TransferEntity from "@domain/entities/financial/TransferEntity";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import ConfirmTransferModal from "./";
import { useConfirmTransferViewModel } from "./hooks";
import { initialState } from "./models/confirmTransferState";

jest.mock("./hooks");

const transfer = new TransferEntity({
  amountOut: "1000.00",
  currencyIn: "USD",
  currencyOut: "BRL",
  dateIn: new Date(2026, 10, 30).toISOString(),
  dateOut: new Date(2026, 10, 30).toISOString(),
  description: "Monthly",
  id: "transfer-1",
  paid: false,
});
const noop = jest.fn();
const item = new TransactionDTO({
  category: "x",
  categoryId: "c",
  date: new Date(2026, 10, 30).toISOString(),
  description: "Monthly",
  id: "row",
  owner: "USER",
  ownerId: "u",
  transferId: "transfer-1",
  type: "EXPENSE",
  value: "1000.00",
});

function setup(
  overrides: Partial<ReturnType<typeof useConfirmTransferViewModel>> = {},
) {
  jest.mocked(useConfirmTransferViewModel).mockReturnValue({
    amountInCents: 0,
    canConfirm: false,
    errorKey: undefined,
    isAmountOutFixed: false,
    isBlocking: false,
    isLoading: false,
    item,
    onAmountInChange: noop,
    onAmountOutChange: noop,
    onClose: noop,
    onConfirm: noop,
    onDateInChange: noop,
    onDateOutChange: noop,
    onRateChange: noop,
    rate: undefined,
    sameCurrency: false,
    state: initialState(transfer),
    transfer,
    ...overrides,
  });

  return render(<ConfirmTransferModal />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the amounts, the days AND a disabled Efetivar until the amount in is known", () => {
  setup();

  expect(screen.getByText("financial.transfers.pay.title")).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferAmountOut),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferAmountIn),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferRate),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferDateOut),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferDateIn),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.confirmPaySubmit),
  ).toBeDisabled();
});

it("SHOULD hide the amount in for one currency AND confirm / cancel through the handlers", () => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();

  setup({
    canConfirm: true,
    isAmountOutFixed: true,
    onClose,
    onConfirm,
    sameCurrency: true,
  });

  expect(
    screen.queryByTestId(transactionsTestIds.confirmTransferAmountIn),
  ).toBeNull();
  fireEvent.press(screen.getByTestId(transactionsTestIds.confirmPaySubmit));
  fireEvent.press(screen.getByTestId(transactionsTestIds.confirmPayCancel));

  expect(onConfirm).toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});

it("SHOULD show the error AND render nothing without a request or while loading", () => {
  setup({ errorKey: "financial.errors.transferAmountInRequired" });
  expect(
    screen.getByTestId(transactionsTestIds.confirmTransferError),
  ).toBeOnTheScreen();

  const { toJSON } = setup({ item: undefined });
  expect(toJSON()).toBeNull();

  setup({ isLoading: true, state: undefined, transfer: undefined });
  expect(
    screen.queryByTestId(transactionsTestIds.confirmTransferAmountOut),
  ).toBeNull();
});
