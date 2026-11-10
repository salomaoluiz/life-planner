import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.asset;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the form fields AND save", () => {
  const { vm } = setup();

  expect(hasText("investment.form.asset.newTitle")).toBe(true);
  expect(screen.getByTestId(ids.ticker)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.name)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.currentValue)).toBeOnTheScreen();

  fireEvent.changeText(screen.getByTestId(ids.ticker), "itsa4");
  fireEvent.changeText(screen.getByTestId(ids.name), "Itaúsa");
  fireEvent.changeText(screen.getByTestId(ids.currentValue), "10,5");
  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onTickerChange).toHaveBeenCalledWith("itsa4");
  expect(vm.onNameChange).toHaveBeenCalledWith("Itaúsa");
  expect(vm.onCurrentValueChange).toHaveBeenCalledWith("10,5");
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the current value WHEN editing AND show the locked hint", () => {
  setup({
    classLocked: true,
    isEditing: true,
    titleKey: "investment.form.asset.editTitle",
  });

  expect(screen.queryByTestId(ids.currentValue)).toBeNull();
  expect(hasText("investment.errors.classLocked")).toBe(true);
});

it("SHOULD show the field errors AND the failure", () => {
  setup({
    failure: { key: "investment.errors.archived" },
    nameError: "investment.form.asset.nameRequired",
    tickerError: "investment.errors.tickerExists",
  });

  expect(hasText("investment.form.asset.nameRequired")).toBe(true);
  expect(hasText("investment.errors.tickerExists")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  const { vm } = setup({ isLoading: true });
  expect(screen.queryByTestId(ids.ticker)).toBeNull();

  setup({ isLoading: false, isNotFound: true });
  fireEvent.press(screen.getAllByText("investment.form.close")[0]);
  expect(vm.onClose).toBeDefined();
});

it("SHOULD show the discard dialog", () => {
  const { vm } = setup({ discardOpen: true });

  fireEvent.press(screen.getByText("common.form.discard"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD show the calculated switch AND the continue label for a new fixed income asset", () => {
  const { vm } = setup({ calculated: true, showCalculated: true });

  expect(screen.getByTestId(ids.calculated)).toBeOnTheScreen();
  expect(hasText("investment.fixedIncome.new.continue")).toBe(true);

  fireEvent(screen.getByTestId(ids.calculated), "valueChange", false);

  expect(vm.onCalculatedChange).toHaveBeenCalledWith(false);
});

it("SHOULD not show the calculated switch for any other asset", () => {
  setup();

  expect(screen.queryByTestId(ids.calculated)).toBeNull();
});
