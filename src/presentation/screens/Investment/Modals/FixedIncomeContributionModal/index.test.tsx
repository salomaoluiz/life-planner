import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.contribution;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the fields AND save", () => {
  const { vm } = setup();

  expect(hasText("investment.fixedIncome.contribution.title")).toBe(true);
  expect(hasText("investment.fixedIncome.contribution.hint")).toBe(true);
  expect(screen.getByTestId(ids.account)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(ids.save));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD hide the account WHEN no finance entry is generated", () => {
  setup({ generate: false });

  expect(screen.queryByTestId(ids.account)).toBeNull();
});

it("SHOULD show the amount error AND the failure", () => {
  setup({ amountError: true, failure: { key: "investment.errors.archived" } });

  expect(hasText("investment.fixedIncome.redeem.invalid")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.amount)).toBeNull();

  setup({ isNotFound: true });
  expect(hasText("investment.detail.notFound")).toBe(true);
});
