import { View } from "react-native";
import * as reactNative from "react-native";

import { ThemeProvider } from "@presentation/theme";
import * as paper from "@presentation/theme/paper";
import * as loader from "@providers/loader";
import { render } from "@tests";

jest.mock("@presentation/theme/paper");
jest.unmock("@presentation/theme");

const providerLoaderResult = {
  isLoading: false,
  setIsLoading: jest.fn(),
};

jest
  .spyOn(paper, "PaperThemeProvider")
  .mockImplementation(({ children, ...props }) => (
    <View testID={"paper-theme-provider"} {...props}>
      {children}
    </View>
  ));
jest.spyOn(reactNative, "useColorScheme").mockReturnValue("light");

jest.spyOn(loader, "useProviderLoader").mockReturnValue(providerLoaderResult);
const defaultProps = {
  children: <View testID={"default-children"} />,
};

function renderComponent() {
  return (
    <ThemeProvider {...defaultProps}>{defaultProps.children}</ThemeProvider>
  );
}

function setup() {
  render(renderComponent());
}

export { providerLoaderResult, setup };
