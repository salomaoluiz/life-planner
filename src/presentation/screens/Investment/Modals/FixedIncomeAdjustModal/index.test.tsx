import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.adjust;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the comparison with the difference AND save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.adjust.title")).toBe(true);
  expect(screen.getByTestId(ids.computed)).toBeOnTheScreen();
  expect(screen.getByTestId(ids.difference)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the comparison WHEN the date has none AND the difference WHEN there is no value", () => {
  setup({ computed: null, difference: null, differencePercent: null });

  expect(screen.queryByTestId(ids.computed)).toBeNull();

  setup({ difference: null, differencePercent: null });

  expect(screen.queryByTestId(ids.difference)).toBeNull();
});

it("SHOULD show the error AND the failure", () => {
  setup({ failure: { key: "investment.errors.archived" }, grossError: true });

  expect(hasText("investment.fixedIncome.redeem.invalid")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.gross)).toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});
