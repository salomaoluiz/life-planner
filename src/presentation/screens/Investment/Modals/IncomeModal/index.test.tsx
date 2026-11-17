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

describe("recurring incomes (spec 115)", () => {
  it("SHOULD switch finance off AND show the explanation instead of account and category", () => {
    const { vm } = setup({
      state: { ...defaultViewModel.state!, withFinance: false },
    });

    fireEvent(screen.getByTestId(ids.withFinance), "valueChange", false);

    expect(vm.onWithFinanceChange).toHaveBeenCalled();
    expect(screen.queryByTestId(ids.account)).toBeNull();
    expect(hasText("investment.income.withoutFinanceTitle")).toBe(true);
  });

  it("SHOULD toggle the repetition only WHEN a new income is created", () => {
    const { vm } = setup();

    fireEvent(screen.getByTestId(ids.repeat), "valueChange", true);

    expect(vm.onRepeatChange).toHaveBeenCalled();

    screen.unmount();
    setup({ repeatAllowed: false });
    expect(screen.queryByTestId(ids.repeat)).toBeNull();
  });

  it("SHOULD show the repetition block, the preview AND the count in the save button", () => {
    setup({
      isSeries: true,
      occurrenceCount: 23,
      preview: {
        count: 23,
        currentMonth: 1,
        endsByPosition: undefined,
        firstNet: "R$ 110,00",
        firstQuantity: "100",
        isLoading: false,
        next: ["15/12/2026", "15/01/2027"],
        past: 22,
      },
      saveLabelKey: "investment.income.saveSeries",
      saveLabelParams: { count: 23 },
      showSeriesBlock: true,
      state: { ...defaultViewModel.state!, repeat: true },
    });

    expect(screen.getByTestId(ids.seriesSummary)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.endDate)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.markPastReceived)).toBeOnTheScreen();
    expect(
      screen.getByText(/investment.income.firstOccurrence/),
    ).toBeOnTheScreen();
    expect(screen.getByText(/investment.income.saveSeries/)).toBeOnTheScreen();
    expect(screen.queryByTestId(ids.netAmount)).toBeNull();
    expect(hasText("investment.income.seriesPreview.positionEnd")).toBe(true);
  });

  it("SHOULD say where the series ends WHEN the position runs out", () => {
    setup({
      isSeries: true,
      preview: {
        count: 6,
        currentMonth: 0,
        endsByPosition: "15/07/2025",
        firstNet: undefined,
        firstQuantity: undefined,
        isLoading: false,
        next: [],
        past: 6,
      },
      showSeriesBlock: true,
      state: { ...defaultViewModel.state!, repeat: true },
    });

    expect(screen.getByText(/seriesPreview.endsByPosition/)).toBeOnTheScreen();
  });

  it("SHOULD disable the save WHEN the series is not valid yet", () => {
    setup({ saveDisabled: true });

    expect(screen.getByTestId(ids.save)).toBeDisabled();
  });

  it("SHOULD ask the scope of an income of a series AND pick one", () => {
    const { vm } = setup({ scopeDate: "15/11/2026", scopeDialogVisible: true });

    fireEvent.press(screen.getByTestId(ids.scope("THIS_AND_NEXT")));
    fireEvent.press(screen.getByTestId(ids.scope("ALL")));

    expect(vm.onScopeSelect).toHaveBeenNthCalledWith(1, "THIS_AND_NEXT");
    expect(vm.onScopeSelect).toHaveBeenNthCalledWith(2, "ALL");
    expect(hasText("investment.income.scope.titleEdit")).toBe(true);
  });

  it("SHOULD edit the header of a series without dates, status, quantity or net amount", () => {
    setup({
      isScopeAll: true,
      isSeriesEdit: true,
      repeatAllowed: false,
      saveLabelKey: "investment.income.seriesModal.save",
      state: { ...defaultViewModel.state!, repeat: false },
    });

    expect(
      screen.getByTestId(investmentTestIds.modal.incomeSeries.endDate),
    ).toBeOnTheScreen();
    expect(screen.queryByTestId(ids.status)).toBeNull();
    expect(screen.queryByTestId(ids.quantity)).toBeNull();
    expect(screen.queryByTestId(ids.netAmount)).toBeNull();
    expect(hasText("investment.income.seriesModal.save")).toBe(true);
  });
});
