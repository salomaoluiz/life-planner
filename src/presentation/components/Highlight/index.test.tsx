import { StyleSheet } from "react-native";

import { render, screen } from "@tests";

import { lightTheme } from "@presentation/theme/provider";

import Highlight from "./index";

it("SHOULD tint the content only while active", () => {
  const { rerender } = render(
    <Highlight active testID="box">
      <></>
    </Highlight>,
  );

  expect(
    StyleSheet.flatten(screen.getByTestId("box").props.style),
  ).toMatchObject({
    backgroundColor: lightTheme.colors.incomeSoft,
  });

  rerender(
    <Highlight active={false} testID="box">
      <></>
    </Highlight>,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("box").props.style)?.backgroundColor,
  ).toBeUndefined();
});

it("SHOULD use the warning tint AND fill the row WHEN asked (spec 094.2)", () => {
  render(
    <Highlight active fill testID="box" tone="warning">
      <></>
    </Highlight>,
  );

  expect(
    StyleSheet.flatten(screen.getByTestId("box").props.style),
  ).toMatchObject({
    backgroundColor: lightTheme.colors.warningSoft,
    flex: 1,
  });
});
