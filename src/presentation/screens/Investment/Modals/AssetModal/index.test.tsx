import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { InvestmentAssetClass } from "@domain/entities/investment/enums";
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
    classHintKey: "investment.errors.classLocked",
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

describe("class from the ticker (spec 111)", () => {
  it("SHOULD show the notice of a class that followed the ticker", () => {
    setup({
      classNotice: InvestmentAssetClass.BR_REIT,
      ticker: "KNRI11",
    });

    expect(screen.getByTestId(ids.classNotice)).toBeOnTheScreen();
    expect(
      hasText(
        'investment.ticker.classAdjusted {"class":"investment.ticker.classNames.BR_REIT","kind":"investment.ticker.classKinds.BR_REIT","ticker":"KNRI11"}',
      ),
    ).toBe(true);
  });

  it("SHOULD hide the notice WHEN there is none", () => {
    setup();

    expect(screen.queryByTestId(ids.classNotice)).toBeNull();
  });

  it("SHOULD explain the limited class AND disable the field for other classes", () => {
    setup({
      classDisabled: true,
      classHintKey: "investment.form.asset.classLockedPairHint",
      isEditing: true,
    });

    expect(hasText("investment.form.asset.classLockedPairHint")).toBe(true);
    expect(hasText("investment.errors.classLocked")).toBe(false);
  });

  it("SHOULD show the class mismatch on the ticker field", () => {
    setup({
      ticker: "KNRI11",
      tickerError: "investment.ticker.classMismatch",
      tickerErrorClass: InvestmentAssetClass.BR_REIT,
    });

    expect(
      hasText(
        'investment.ticker.classMismatch {"class":"investment.ticker.classNames.BR_REIT","kind":"investment.ticker.classKinds.BR_REIT","ticker":"KNRI11"}',
      ),
    ).toBe(true);
  });

  it("SHOULD ask before swapping the class of an asset with operations", () => {
    const { vm } = setup({ classConfirmOpen: true, isEditing: true });

    expect(screen.getByTestId(ids.classConfirm)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(`${ids.classConfirm}-confirm`));
    expect(vm.onClassConfirm).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByTestId(`${ids.classConfirm}-cancel`));
    expect(vm.onClassCancel).toHaveBeenCalledTimes(1);
  });
});
