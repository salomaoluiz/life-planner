import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { defaultViewModel, setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.rate;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the rate fields, the effective rate AND the history, then save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.updateRate.title")).toBe(true);
  expect(screen.getByTestId(ids.field("cdiPercent"))).toBeOnTheScreen();
  expect(screen.getByTestId(ids.field("indexRate"))).toBeOnTheScreen();
  expect(screen.getByTestId(ids.effective)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.history)).toBeOnTheScreen();
  expect(
    screen.queryByText(/investment\.fixedIncome\.updateRate\.newEntry/),
  ).toBeTruthy();

  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD change a field AND the mode through the form", () => {
  const { vm } = setup();

  fireEvent.changeText(screen.getByTestId(ids.field("indexRate")), "15,2");
  fireEvent.press(screen.getByText("investment.fixedIncome.rateMode.PREFIXED"));

  expect(vm.onFormChange).toHaveBeenCalledWith({
    ...defaultViewModel.form,
    indexRate: "15,2",
  });
  expect(vm.onFormChange).toHaveBeenCalledWith({
    ...defaultViewModel.form,
    mode: InvestmentFixedIncomeRateMode.PREFIXED,
  });
});

it("SHOULD use the edit copy WHEN editing AND show the failure", () => {
  setup({ failure: { key: "investment.errors.archived" }, isEditing: true });

  expect(hasText("investment.fixedIncome.updateRate.edit")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD flag an empty field WHEN the form is invalid", () => {
  setup({
    form: { ...defaultViewModel.form, cdiPercent: "" },
    invalid: true,
  });

  expect(hasText("investment.fixedIncome.new.invalid")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.field("cdiPercent"))).toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});
