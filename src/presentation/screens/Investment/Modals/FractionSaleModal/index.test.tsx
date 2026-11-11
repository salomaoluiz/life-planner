import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.fractionSale;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the fraction, the realized result AND save the sale", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.save));

  expect(screen.getByText(/investment.fraction.title/)).toBeOnTheScreen();
  expect(screen.getByText(/investment.fraction.strip/)).toBeOnTheScreen();
  expect(hasText("+R$ 0,14")).toBe(true);
  expect(hasText("investment.fraction.positionUnchanged")).toBe(true);
  expect(hasText("investment.fraction.accountHint")).toBe(true);
  expect(screen.queryByTestId(ids.delete)).toBeNull();
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD add a fee row, change it AND remove it", () => {
  const { vm } = setup({
    fees: [{ amountCents: 20, key: "fee-1", kind: "BROKERAGE" as never }],
  });

  fireEvent.press(screen.getByTestId(`${ids.account}-add-fee`));
  fireEvent.press(screen.getByTestId(`${ids.account}-fee-remove-0`));

  expect(vm.onAddFee).toHaveBeenCalledTimes(1);
  expect(vm.onFeeRemove).toHaveBeenCalledWith("fee-1");
});

it("SHOULD hide the amount, the account AND the fees WHEN the fraction is written off", () => {
  setup({ gross: 0, realized: "−R$ 5,06", writeOff: true });

  expect(screen.queryByTestId(ids.gross)).toBeNull();
  expect(screen.queryByTestId(ids.account)).toBeNull();
  expect(hasText("investment.fraction.writeOffHint")).toBe(true);
});

it("SHOULD offer to delete AND say Save WHEN editing", () => {
  const { vm } = setup({ isEdit: true });

  fireEvent.press(screen.getByTestId(ids.delete));

  expect(vm.onDelete).toHaveBeenCalledTimes(1);
  expect(screen.getByText(/investment.fraction.editTitle/)).toBeOnTheScreen();
  expect(hasText("investment.fraction.saveEdit")).toBe(true);
});

it("SHOULD show the date, fee AND failure errors", () => {
  setup({
    errors: { account: true, date: "before", fees: true, gross: false },
    failure: { key: "investment.event.noPosition", params: { date: "x" } },
  });

  expect(hasText("investment.fraction.dateErrors.before")).toBe(true);
  expect(hasText("investment.errors.feesAboveSale")).toBe(true);
  expect(screen.getByText(/investment.event.noPosition/)).toBeOnTheScreen();
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.gross)).toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});
