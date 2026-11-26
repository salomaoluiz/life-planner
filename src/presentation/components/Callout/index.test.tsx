import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

import Callout from "./index";

it("SHOULD render its children inside the box", () => {
  render(
    <Callout testID="box" tone="expense">
      <Text>message</Text>
    </Callout>,
  );

  expect(screen.getByTestId("box")).toBeOnTheScreen();
  expect(screen.getByText("message")).toBeOnTheScreen();
});

it("SHOULD announce an alert AND stay silent otherwise", () => {
  render(
    <>
      <Callout role="alert" testID="alert" tone="warning">
        <Text>a</Text>
      </Callout>
      <Callout testID="plain" tone="warning">
        <Text>b</Text>
      </Callout>
    </>,
  );

  expect(screen.getByTestId("alert").props.role).toBe("alert");
  expect(screen.getByTestId("plain").props.role).toBeUndefined();
});
