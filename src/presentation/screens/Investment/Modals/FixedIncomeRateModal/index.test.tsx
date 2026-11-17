import { fireEvent, screen } from "@testing-library/react-native";
import { router } from "expo-router";

import { hasText } from "@tests";

import { InvestmentFixedIncomeRateMode } from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { defaultViewModel, setup } from "./mocks/index.mocks";

const mockUseMarketIndexes = jest.fn(() => ({ data: undefined as unknown }));

jest.mock("@screens/Investment/hooks/useMarketIndexes", () => ({
  __esModule: true,
  default: () => mockUseMarketIndexes(),
}));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

const ids = investmentTestIds.modal.rate;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the rate fields, the effective rate AND the history, then save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.updateRate.title")).toBe(true);
  expect(screen.getByTestId(ids.field("cdiPercent"))).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.field("indexRate"))).toBeNull();
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

  fireEvent.changeText(screen.getByTestId(ids.field("cdiPercent")), "120");
  fireEvent.press(screen.getByText("investment.fixedIncome.rateMode.PREFIXED"));

  expect(vm.onFormChange).toHaveBeenCalledWith({
    ...defaultViewModel.form,
    cdiPercent: "120",
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

it("SHOULD explain where the CDI comes from, link to Settings AND show the effective rate from the stored CDI (spec 113)", () => {
  mockUseMarketIndexes.mockReturnValue({
    data: {
      cdi: {
        annual: "14.90",
        daily: "0.0551310",
        date: "2026-11-11",
        followers: 1,
        lastChangeDate: null,
        stale: false,
      },
      fx: [],
      ipca: null,
      lastSuccessAt: null,
      selic: null,
    },
  });
  setup();

  expect(
    screen.getByText(/investment.fixedIncome.cdiInfo\b/),
  ).toBeOnTheScreen();
  expect(hasText("investment.fixedIncome.effectiveFollows")).toBe(true);

  fireEvent.press(screen.getByText("investment.fixedIncome.cdiInfoLink"));

  expect(router.push).toHaveBeenCalledWith("/investments/settings");
});

it("SHOULD say the indexes are not here yet WHEN none is stored", () => {
  mockUseMarketIndexes.mockReturnValue({ data: undefined });
  setup();

  expect(hasText("investment.fixedIncome.indexMissing")).toBe(true);
});
