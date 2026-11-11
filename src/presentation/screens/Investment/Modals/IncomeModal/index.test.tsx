import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { defaultViewModel, setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.income;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the two columns of fields AND save", () => {
  const { vm } = setup();

  fireEvent.changeText(screen.getByTestId(ids.quantity), "10");
  fireEvent.changeText(screen.getByTestId(ids.perUnit), "0,5");
  fireEvent.press(screen.getByTestId(ids.save));

  expect(hasText("investment.income.title.create")).toBe(true);
  expect(hasText("investment.income.netAmountHint")).toBe(true);
  expect(vm.onQuantityChange).toHaveBeenCalledWith("10");
  expect(vm.onPerUnitChange).toHaveBeenCalledWith("0,5");
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD show the withholding estimate only WHEN there is one", () => {
  setup();
  expect(screen.getByTestId(ids.estimate)).toBeOnTheScreen();
});

it("SHOULD hide the estimate AND label the date as received WHEN the income is received", () => {
  setup({
    estimate: { gross: "R$ 71,40", rate: "0%", show: false },
    state: {
      ...defaultViewModel.state!,
      status: InvestmentIncomeStatus.RECEIVED,
    },
  });

  expect(screen.queryByTestId(ids.estimate)).toBeNull();
  expect(hasText("investment.income.receivedOn")).toBe(true);
});

it("SHOULD show the delete action only WHEN editing AND confirm it", () => {
  setup();
  expect(screen.queryByTestId(ids.delete)).toBeNull();

  const { vm } = setup({ isDeleteOpen: true, isEditing: true });
  fireEvent.press(screen.getByTestId(ids.delete));

  expect(vm.onDeleteOpen).toHaveBeenCalled();
});

it("SHOULD show the hint of the suggested type WHEN approving", () => {
  setup({ isApproving: true, saveLabelKey: "investment.suggestions.approve" });

  expect(hasText("investment.income.typeHint")).toBe(true);
  expect(hasText("investment.suggestions.approve")).toBe(true);
});

it("SHOULD show the field errors AND the failure", () => {
  setup({
    errors: { accountId: "investment.form.operation.accountRequired" },
    failure: { key: "investment.income.errors.currencyMismatch" },
  });

  expect(hasText("investment.form.operation.accountRequired")).toBe(true);
  expect(hasText("investment.income.errors.currencyMismatch")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.save)).not.toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});

it("SHOULD render the loading skeleton WHEN the form state is not ready", () => {
  setup({ state: undefined });
  expect(screen.queryByTestId(ids.quantity)).toBeNull();
});
