import { renderHook } from "@testing-library/react-native";
import { ThemeProvider, useTheme } from "@presentation/theme";
import * as loader from "@providers/loader";
import * as paper from "@presentation/theme/paper/hook";
import { lightTheme } from "@presentation/theme/provider";

jest.mock("@presentation/theme/paper/hook");
jest.unmock("@presentation/theme");

const providerLoaderResult = {
  setIsLoading: jest.fn(),
  isLoading: false,
};

jest.spyOn(paper, "default").mockReturnValue(lightTheme);
jest.spyOn(loader, "useProviderLoader").mockReturnValue(providerLoaderResult);

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return renderHook(useTheme, { wrapper: ThemeProvider });
}

export { setup };
