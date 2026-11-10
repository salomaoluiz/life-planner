import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { InvestmentFixedIncomeLiquidity } from "@domain/entities/investment/enums";
import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.fixedIncomeTitle;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the title, the rate AND the estimate at maturity, then save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.new.title")).toBe(true);
  expect(screen.getByTestId(ids.product)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.taxExempt)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.field("cdiPercent"))).toBeOnTheScreen();
  expect(screen.getByTestId(ids.effective)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.estimateNet)).toBeOnTheScreen();
  expect(hasText("investment.fixedIncome.rateHint")).toBe(true);

  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD edit the name AND the rate", () => {
  const { vm } = setup();

  fireEvent.changeText(screen.getByTestId(ids.name), "CDB 2030");
  fireEvent.changeText(screen.getByTestId(ids.field("indexRate")), "15");

  expect(vm.onNameChange).toHaveBeenCalledWith("CDB 2030");
  expect(vm.onRateChange).toHaveBeenCalledWith(
    expect.objectContaining({ indexRate: "15" }),
  );
});

it("SHOULD show the grace date only for a grace period AND the account only with a finance entry", () => {
  setup({ liquidity: InvestmentFixedIncomeLiquidity.GRACE_PERIOD });

  expect(screen.getByTestId(ids.liquidityDate)).toBeOnTheScreen();

  setup({ generate: false });

  expect(screen.queryByTestId(ids.account)).toBeNull();
});

it("SHOULD show what the estimate is doing WHEN there is none", () => {
  setup({ estimate: undefined, estimateLoading: true });

  expect(hasText("investment.fixedIncome.estimateLoading")).toBe(true);

  setup({ estimate: undefined, estimateLoading: false });

  expect(hasText("investment.fixedIncome.estimateHint")).toBe(true);
});

it("SHOW the IOF line only WHEN there is IOF", () => {
  setup({
    estimate: {
      atMaturity: { gross: 100, iof: 5, ir: 1, net: 94 },
      effectiveRate: "10.000000",
    },
  });

  expect(hasText("investment.fixedIncome.iofEstimated")).toBe(true);
});

it("SHOULD show the validation errors AND the failure", () => {
  setup({
    errors: {
      amount: true,
      grace: true,
      maturity: true,
      name: true,
      rate: true,
    },
    failure: { key: "investment.errors.archived" },
  });

  expect(hasText("investment.fixedIncome.new.maturityInvalid")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
  expect(
    screen.getAllByText("investment.fixedIncome.new.invalid").length,
  ).toBeGreaterThan(0);
});
