import { View } from "react-native";

import { render, screen } from "@tests";

import { lightTheme } from "../provider";
import { buildPaperTheme } from "./buildPaperTheme";
import PaperThemeProvider from "./provider";

const defaultProps = {
  children: <View testID="default-children" />,
  theme: buildPaperTheme(lightTheme),
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
