import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.suggestions;

beforeEach(() => jest.clearAllMocks());

it("SHOULD list the suggestions with the count AND go back", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.back));

  expect(hasText("investment.suggestions.title")).toBe(true);
  expect(hasText("investment.suggestions.subtitle")).toBe(true);
  expect(screen.getByTestId(`${ids.row}-sug-1`)).toBeOnTheScreen();
  expect(vm.onBack).toHaveBeenCalled();
});

it("SHOULD show the empty state", () => {
  setup({ count: 0, isEmpty: true, items: [] });

  expect(screen.getByTestId(ids.empty)).toBeOnTheScreen();
});

it("SHOULD show the loading AND the error with a retry", () => {
  setup({ isLoading: true, items: [] });
  expect(screen.queryByTestId(`${ids.row}-sug-1`)).toBeNull();

  const { vm } = setup({ errorMessage: "boom", items: [] });
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD show the failure of a decision", () => {
  setup({
    actions: {
      failure: { key: "investment.income.errors.incomplete" },
      isBusy: false,
      onApprove: jest.fn(),
      onEdit: jest.fn(),
      onReject: jest.fn(),
    },
  });

  expect(hasText("investment.income.errors.incomplete")).toBe(true);
});
