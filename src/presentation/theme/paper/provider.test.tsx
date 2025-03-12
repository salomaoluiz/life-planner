import { View } from "react-native";

import { render, screen } from "@tests";

import PaperThemeProvider from "./provider";

const defaultProps = {
  children: <View testID="default-children" />,
  theme: {
    colors: {
      primary: "blue",
    },
  },
};

function setup() {
  return render(
    <PaperThemeProvider theme={defaultProps.theme}>
      {defaultProps.children}
    </PaperThemeProvider>,
  );
}

it("SHOULD render the provider correctly", () => {
  setup();

  expect(screen.getByTestId("default-children")).toBeOnTheScreen();
});
