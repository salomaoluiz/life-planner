import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { InvestmentFixedIncomeRedemptionKind } from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.redeem;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the form AND the estimate of the app, then save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.redeem.title")).toBe(true);
  expect(hasText("investment.fixedIncome.redeem.estimate")).toBe(true);
  expect(screen.getByTestId(ids.preview)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.remaining)).toBeOnTheScreen();
  expect(hasText("investment.fixedIncome.redeem.lotsUsed")).toBe(true);

  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD show the liquidity warning WHEN there is one", () => {
  setup({ liquidityWarning: "AT_MATURITY" });

  expect(screen.getByTestId(ids.liquidityWarning)).toBeOnTheScreen();
});

it("SHOULD show the hint of a total redemption AND the account only WHEN a finance entry is generated", () => {
  setup({ kind: InvestmentFixedIncomeRedemptionKind.TOTAL });

  expect(hasText("investment.fixedIncome.redeem.totalHint")).toBe(true);
  expect(screen.getByTestId(ids.account)).toBeOnTheScreen();

  setup({ generate: false });

  expect(screen.queryByTestId(ids.account)).toBeNull();
});

it("SHOULD show what the preview is doing WHEN there is none yet", () => {
  setup({ isPreviewing: true, preview: undefined });

  expect(screen.getByTestId(ids.previewEmpty)).toBeOnTheScreen();
  expect(hasText("investment.fixedIncome.redeem.previewLoading")).toBe(true);

  setup({ isPreviewing: false, preview: undefined });

  expect(hasText("investment.fixedIncome.estimateHint")).toBe(true);
});

it("SHOULD show the error under the amount AND the failure", () => {
  setup({
    availableNet: 1603607,
    failure: { key: "investment.errors.archived" },
    preview: undefined,
  });

  expect(
    screen.queryByText(/investment\.fixedIncome\.redeem\.tooLarge/),
  ).toBeTruthy();
  expect(hasText("investment.errors.archived")).toBe(true);

  setup({ netError: true });

  expect(hasText("investment.fixedIncome.redeem.invalid")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.net)).toBeNull();

  const { vm } = setup({ isNotFound: true });

  fireEvent.press(screen.getAllByText("investment.form.close")[0]);
  expect(vm.onClose).toBeDefined();
});

it("SHOULD show the subtitle with the estimated net of today", () => {
  setup();

  expect(
    screen.queryByText(/investment\.fixedIncome\.redeem\.subtitle/),
  ).toBeTruthy();
});
