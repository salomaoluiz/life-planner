import * as paper from "@presentation/theme/paper";
import { View } from "react-native";
import * as reactNative from "react-native";
import * as loader from "@providers/loader";
import { render } from "@tests";
import { ThemeProvider } from "@presentation/theme";

jest.mock("@presentation/theme/paper");
jest.unmock("@presentation/theme");

const providerLoaderResult = {
  setIsLoading: jest.fn(),
  isLoading: false,
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

const renderComponent = () => (
  <ThemeProvider {...defaultProps}>{defaultProps.children}</ThemeProvider>
);

const setup = () => render(renderComponent());

export { setup, providerLoaderResult };
