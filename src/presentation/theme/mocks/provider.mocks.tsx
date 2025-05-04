import { View } from "react-native";
import * as reactNative from "react-native";

import { render } from "@tests";

import ConfigsDTO from "@application/dto/configs/ConfigsDTO";
import { useCases } from "@application/useCases";
import * as fetcher from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import * as monitoring from "@infrastructure/monitoring";
import { ThemeProvider } from "@presentation/theme";
import { colors } from "@presentation/theme/constants";
import * as paper from "@presentation/theme/paper";
import * as loader from "@providers/loader";

// region Mocks
jest.mock("@presentation/theme/paper");
jest.unmock("@presentation/theme");
jest.mock("@infrastructure/fetcher");

const providerLoaderResponse = {
  isLoading: false,
  setIsLoading: jest.fn(),
};
const useMutationFixture = new UseMutationFixture<unknown, void>().reset();
const useMutationResponse = useMutationFixture.build();

const useQueryFixture = new UseQueryFixture<Partial<ConfigsDTO>>().reset();
const useQueryPendingResponse = useQueryFixture.withStatus("pending").build();
const useQueryDarkModeResponse = useQueryFixture
  .withData({ darkMode: true })
  .withStatus("success")
  .build();

const defaultProps = {
  children: <View testID={"default-children"} />,
};

// region Mocks

// region Spies

jest
  .spyOn(paper, "PaperThemeProvider")
  .mockImplementation(({ children, ...props }) => (
    <View testID={"paper-theme-provider"} {...props}>
      {children}
    </View>
  ));

/* @default: light */
const useColorSchemeSpy = jest
  .spyOn(reactNative, "useColorScheme")
  .mockReturnValue("light");

const useProviderLoaderSpy = jest
  .spyOn(loader, "useProviderLoader")
  .mockReturnValue(providerLoaderResponse);

const useQuerySpy = jest
  .spyOn(fetcher, "useQuery")
  .mockReturnValue(useQueryPendingResponse);

const useMutationSpy = jest
  .spyOn(fetcher, "useMutation")
  .mockReturnValue(useMutationResponse);

const setBarStyleSpy = jest.spyOn(reactNative.StatusBar, "setBarStyle");
const setBackgroundColorSpy = jest.spyOn(
  reactNative.StatusBar,
  "setBackgroundColor",
);
const setHiddenSpy = jest.spyOn(reactNative.StatusBar, "setHidden");

const captureMessageSpy = jest.spyOn(monitoring, "captureMessage");
// endregion Spies

function renderComponent() {
  return (
    <ThemeProvider {...defaultProps}>{defaultProps.children}</ThemeProvider>
  );
}

function setup() {
  render(renderComponent());
}

const mocks = {
  colors,
  providerLoaderResponse,
  useCases,
  useQuery: {
    darkMode: useQueryDarkModeResponse,
    fixture: useQueryFixture,
    pending: useQueryPendingResponse,
  },
};

const spies = {
  captureMessage: captureMessageSpy,
  setBackgroundColor: setBackgroundColorSpy,
  setBarStyle: setBarStyleSpy,
  setHidden: setHiddenSpy,
  useColorScheme: useColorSchemeSpy,
  useMutation: useMutationSpy,
  useProviderLoader: useProviderLoaderSpy,
  useQuery: useQuerySpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, renderComponent, setup, spies };
export { screen } from "@tests";
