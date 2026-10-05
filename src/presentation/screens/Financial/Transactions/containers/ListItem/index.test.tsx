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

it("SHOULD pass its props to the list item hook", () => {
  const { item } = setup();

  expect(spies.useListItem).toHaveBeenCalledWith({
    item,
    refetch: mocks.refetch,
  });
});

it("SHOULD render date, description, category with account and value", () => {
  const { item } = setup();

  expect(hasText(item.transactionDate)).toBe(true);
  expect(hasText("Groceries")).toBe(true);
  expect(hasText("Food • Checking")).toBe(true);
  expect(hasText("R$ 50.00")).toBe(true);
});

it("SHOULD render only the category WHEN there is no account name", () => {
  setup({ accountName: undefined });

  expect(hasText("Food")).toBe(true);
  expect(hasText("Food • Checking")).toBe(false);
});

it("SHOULD use the expense icon and color WHEN the transaction is an expense", () => {
  setup({ type: "EXPENSE" });
  const { theme } = useTheme();

  expect(
    screen.UNSAFE_getAllByProps({ source: "arrow-down-bold" }),
  ).toBeTruthy();
  expect(colorOf("R$ 50.00")).toBe(theme.colors.expense);
});

it("SHOULD use the income icon and color WHEN the transaction is an income", () => {
  setup({ type: "INCOME" });
  const { theme } = useTheme();

  expect(screen.UNSAFE_getAllByProps({ source: "arrow-up-bold" })).toBeTruthy();
  expect(colorOf("R$ 50.00")).toBe(theme.colors.income);
});

it("SHOULD call onDelete WHEN the delete button is pressed", () => {
  setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.delete")[0]);

  expect(mocks.onDelete).toHaveBeenCalledTimes(1);
});
