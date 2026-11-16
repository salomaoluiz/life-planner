import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.conversion;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the before/after of both positions, the fraction box AND convert", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.submit));

  expect(screen.getByText(/investment.conversion.title/)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.preview)).toBeOnTheScreen();
  expect(hasText("R$ 8.593,38")).toBe(true);
  expect(
    screen.getByText(/investment.conversion.fractionInfo/),
  ).toBeOnTheScreen();
  expect(hasText("investment.conversion.noFinanceEntry")).toBe(true);
  expect(screen.queryByTestId(ids.account)).toBeNull();
  expect(vm.onSubmit).toHaveBeenCalledTimes(1);
});

it("SHOULD change the destination, the ratio AND the cash part", () => {
  const { vm } = setup();

  fireEvent.changeText(screen.getByTestId(ids.ratioTo), "2");
  fireEvent.changeText(screen.getByTestId(ids.ratioFrom), "3");

  expect(vm.onRatioToChange).toHaveBeenCalledWith("2");
  expect(vm.onRatioFromChange).toHaveBeenCalledWith("3");
});

it("SHOULD ask for the account AND the reference value WHEN there is a cash part", () => {
  setup({ cashAmount: 1500, hasCash: true });

  expect(screen.getByTestId(ids.account)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.referenceValue)).toBeOnTheScreen();
  expect(screen.getByText(/investment.conversion.cashLabel/)).toBeOnTheScreen();
});

it("SHOULD create a new destination with its ticker AND name", () => {
  const { vm } = setup({ mode: "new", ticker: "XPTO11" });

  fireEvent.changeText(screen.getByTestId(ids.name), "Fundo Exemplo");

  expect(vm.onNameChange).toHaveBeenCalledWith("Fundo Exemplo");
  expect(screen.getByTestId(`${ids.ticker}-input`)).toBeOnTheScreen();
  expect(hasText("investment.conversion.fromOrigin")).toBe(true);
});

it("SHOULD say there is no asset of the same class WHEN the picker is empty", () => {
  setup({ destinationOptions: [] });

  expect(hasText("investment.conversion.pickerEmpty")).toBe(true);
});

it("SHOULD show the destination as text WHEN editing", () => {
  setup({ isEdit: true });

  expect(screen.getByText(/investment.conversion.editTitle/)).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.segment)).toBeNull();
});

it("SHOULD show the failure of the API inline", () => {
  setup({
    failure: {
      key: "investment.conversion.errors.laterOperations",
      params: { date: "15/10/2026", ticker: "BCFF11" },
    },
  });

  expect(screen.getByTestId(ids.error)).toBeOnTheScreen();
});

it("SHOULD show the not found state AND the skeleton", () => {
  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});

it("SHOULD show a skeleton while loading", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.preview)).toBeNull();
});
