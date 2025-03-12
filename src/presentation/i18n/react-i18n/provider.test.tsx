import { View } from "react-native";

import { render, screen } from "@tests";

import * as hooks from "./hooks";
import { ReactI18NPProvider } from "./provider";

// region Mocks
jest.mock("./hooks", () => ({
  useI18NInitializer: jest.fn(),
}));

const Children = () => <View testID={"provider-children"} />;

const defaultProps = {
  children: <Children />,
};

// endregion

const setup = () =>
  render(<ReactI18NPProvider>{defaultProps.children}</ReactI18NPProvider>);

it("should call initializer hook", () => {
  setup();

  expect(hooks.useI18NInitializer).toHaveBeenCalledTimes(1);
});

it("should render correctly the children", () => {
  setup();

  const children = screen.getByTestId("provider-children");

  expect(children).toBeOnTheScreen();
});
