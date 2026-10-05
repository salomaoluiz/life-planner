import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function colorOf(text: string) {
  const element = screen.UNSAFE_getAllByProps({ children: text })[0];
  return StyleSheet.flatten(element.props.style).color;
}

function setupWeb(overrides: Parameters<typeof setup>[0] = {}) {
  return setup(overrides, "web");
}

it("SHOULD pass its props to the list item hook", () => {
  const { item } = setupWeb();

  expect(spies.useListItem).toHaveBeenCalledWith({
    item,
    refetch: mocks.refetch,
  });
});

it("SHOULD render date, description, category and value in separate columns", () => {
  const { item } = setupWeb();

  expect(hasText(item.transactionDate)).toBe(true);
  expect(hasText("Groceries")).toBe(true);
  expect(hasText("Food")).toBe(true);
  expect(hasText("R$ 50.00")).toBe(true);
});

it("SHOULD NOT render the account name", () => {
  setupWeb();

  expect(hasText("Food • Checking")).toBe(false);
});

it("SHOULD use the expense icon and color WHEN the transaction is an expense", () => {
  setupWeb({ type: "EXPENSE" });
  const { theme } = useTheme();

  expect(
    screen.UNSAFE_getAllByProps({ source: "arrow-down-bold" }),
  ).toBeTruthy();
  expect(colorOf("R$ 50.00")).toBe(theme.colors.expense);
});

it("SHOULD use the income icon and color WHEN the transaction is an income", () => {
  setupWeb({ type: "INCOME" });
  const { theme } = useTheme();

  expect(screen.UNSAFE_getAllByProps({ source: "arrow-up-bold" })).toBeTruthy();
  expect(colorOf("R$ 50.00")).toBe(theme.colors.income);
});

it("SHOULD call onDelete WHEN the delete button is pressed", () => {
  setupWeb();

  fireEvent.press(screen.getAllByLabelText("common.actions.delete")[0]);

  expect(mocks.onDelete).toHaveBeenCalledTimes(1);
});
