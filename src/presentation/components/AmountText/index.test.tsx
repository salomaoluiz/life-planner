import { StyleSheet } from "react-native";

import { screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import { setup } from "./mocks/index.mocks";

function text() {
  return screen.getByTestId("amount");
}

it("SHOULD render a negative expense in pt-BR with expense tone and tabular digits", () => {
  setup({ type: "EXPENSE" });
  expect(text().props.children).toBe("− R$ 312,90");
  const style = StyleSheet.flatten(text().props.style);
  expect(style.color).toBe(lightTheme.colors.expense);
  expect(style.fontVariant).toEqual(["tabular-nums"]);
});

it("SHOULD render income with + and income tone", () => {
  setup({ type: "INCOME" });
  expect(text().props.children).toBe("+ R$ 312,90");
  expect(StyleSheet.flatten(text().props.style).color).toBe(
    lightTheme.colors.income,
  );
});

it("SHOULD render without sign and with primary tone WHEN no type", () => {
  setup();
  expect(text().props.children).toBe("R$ 312,90");
  expect(StyleSheet.flatten(text().props.style).color).toBe(
    lightTheme.colors.textPrimary,
  );
});

it("SHOULD color WITHOUT a sign WHEN only tone is given", () => {
  setup({ tone: "income" });
  expect(text().props.children).toBe("R$ 312,90");
  expect(StyleSheet.flatten(text().props.style).color).toBe(
    lightTheme.colors.income,
  );
});

it("SHOULD let tone override the type color", () => {
  setup({ tone: "secondary", type: "EXPENSE" });
  expect(StyleSheet.flatten(text().props.style).color).toBe(
    lightTheme.colors.textSecondary,
  );
});

it("SHOULD use the caption scale with the secondary tone by default", () => {
  setup({ size: "caption" });
  const style = StyleSheet.flatten(text().props.style);
  expect(style.fontSize).toBe(lightTheme.typography.caption.fontSize);
  expect(style.color).toBe(lightTheme.colors.textSecondary);
});

it.each([
  ["body", "body"],
  ["heading", "heading"],
  ["display", "display"],
] as const)("SHOULD use the %s scale", (size, token) => {
  setup({ size });
  expect(StyleSheet.flatten(text().props.style).fontSize).toBe(
    lightTheme.typography[token].fontSize,
  );
});

it("SHOULD format with USD in en-US", () => {
  setup({}, "en-US");
  expect(text().props.children).toBe("$312.90");
});
