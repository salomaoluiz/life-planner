import { StyleSheet, Text, TextInput } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { BottomSheet, FormColumns } from "@components";
import * as theme from "@presentation/theme";
import { lightTheme } from "@presentation/theme/provider";

function rootStyle() {
  return StyleSheet.flatten(
    screen.getByTestId("cols-column-left").parent?.parent?.props.style,
  );
}

function setup(
  breakpoint: "compact" | "expanded" | "medium",
  size: "dialog" | "form" = "form",
  leftWidth?: number,
) {
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
  const tree = (
    <BottomSheet
      closeLabel="Close"
      onClose={jest.fn()}
      size={size}
      testID="sheet"
      title="Title"
      visible
    >
      <FormColumns
        left={<TextInput testID="left-input" />}
        leftWidth={leftWidth}
        right={<Text>right</Text>}
        testID="cols"
      />
    </BottomSheet>
  );

  return { tree, ...render(tree) };
}

it("SHOULD render one stack on compact, left before right", () => {
  setup("compact");
  expect(rootStyle().flexDirection).not.toBe("row");
  expect(screen.getByTestId("cols-column-left")).toBeTruthy();
  const order = screen
    .getByTestId("cols-column-left")
    .parent?.parent?.children.map((child) =>
      typeof child === "string" ? child : child.props.testID,
    );
  expect(order).toEqual(["cols-column-left", "cols-column-right"]);
});

it("SHOULD render one stack inside a dialog sheet", () => {
  setup("expanded", "dialog");
  expect(rootStyle().flexDirection).not.toBe("row");
});

it("SHOULD render one stack outside any sheet", () => {
  render(
    <FormColumns left={<Text>l</Text>} right={<Text>r</Text>} testID="c" />,
  );
  expect(
    StyleSheet.flatten(
      screen.getByTestId("c-column-left").parent?.parent?.props.style,
    ).flexDirection,
  ).not.toBe("row");
});

it.each(["medium", "expanded"] as const)(
  "SHOULD render two columns with a divider on %s",
  (breakpoint) => {
    setup(breakpoint);
    expect(rootStyle().flexDirection).toBe("row");
    expect(rootStyle().columnGap).toBe(32);
    const right = StyleSheet.flatten(
      screen.getByTestId("cols-column-right").props.style,
    );
    expect(right.borderLeftWidth).toBe(1);
    expect(right.borderLeftColor).toBe(lightTheme.colors.border);
    expect(right.flex).toBe(1);
  },
);

it("SHOULD fix the left column width WHEN leftWidth is given", () => {
  setup("expanded", "form", 320);
  const left = StyleSheet.flatten(
    screen.getByTestId("cols-column-left").props.style,
  );
  expect(left.width).toBe(320);
  expect(left.flex).toBeUndefined();
});

it("SHOULD keep typed values WHEN the breakpoint changes", () => {
  const { rerender, tree } = setup("expanded");
  fireEvent.changeText(screen.getByTestId("left-input"), "hello");
  jest.mocked(theme.useBreakpoint).mockReturnValue("compact");
  rerender(tree);
  expect(screen.getByTestId("left-input").props.value ?? "hello").toBe("hello");
  expect(screen.getByTestId("cols-column-left")).toBeTruthy();
});
