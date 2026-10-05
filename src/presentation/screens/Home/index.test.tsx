import "@shopify/flash-list/jestSetup";

import { render, screen } from "@tests";

import ProfileButton from "@screens/Navigation/containers/ProfileButton";

import Home from "./";
import { useHomeViewModel } from "./hooks";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@screens/Navigation/containers/ProfileButton", () => ({
  __esModule: true,
  default: jest.fn(() => {
    const { View: MockView } = jest.requireActual("react-native");

    return <MockView testID="home-profile-button" />;
  }),
}));

const state = { isError: false, isLoading: true, onRetry: jest.fn() };

function givenViewModel(overrides: Record<string, unknown> = {}) {
  jest.mocked(useHomeViewModel).mockReturnValue({
    filter: {
      onChange: jest.fn(),
      options: [
        { labelKey: "home.filter.all", value: "ALL" },
        { label: "Silva", value: "family-1" },
      ],
      value: "ALL",
    },
    header: {
      avatarName: "Ana",
      avatarPhotoUrl: undefined,
      greetingKey: "home.greeting.morning",
      greetingParams: { name: "Ana" },
      overline: "Saturday, October 3",
    },
    isRefreshing: false,
    isSplitLayout: false,
    onAddStockItemPress: jest.fn(),
    onAddTransactionPress: jest.fn(),
    onRefresh: jest.fn(),
    onStockSeeAllPress: jest.fn(),
    onSummaryPress: jest.fn(),
    onTransactionsSeeAllPress: jest.fn(),
    stock: state,
    summary: state,
    transactions: state,
    ...overrides,
  } as never);
}

it("SHOULD render the header, the filter and the three blocks", () => {
  givenViewModel();

  render(<Home />);

  expect(screen.getByText("Saturday, October 3")).toBeOnTheScreen();
  expect(
    screen.getByText('home.greeting.morning {"name":"Ana"}'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId("home-filter-ALL")).toBeOnTheScreen();
  expect(screen.getByTestId("home-summary-loading")).toBeOnTheScreen();
  expect(screen.getByTestId("home-stock-loading")).toBeOnTheScreen();
  expect(screen.getAllByTestId("home-transactions-loading")).toHaveLength(3);
});

it("SHOULD show an error only in the failed block", () => {
  givenViewModel({ stock: { ...state, isError: true, isLoading: false } });

  render(<Home />);

  expect(screen.getByTestId("home-stock-error")).toBeOnTheScreen();
  expect(screen.getByTestId("home-summary-loading")).toBeOnTheScreen();
});

it("SHOULD render the profile button (009) with the user name", () => {
  givenViewModel();

  render(<Home />);

  expect(screen.getByTestId("home-profile-button")).toBeOnTheScreen();
  expect(jest.mocked(ProfileButton).mock.calls[0][0]).toMatchObject({
    name: "Ana",
  });
});

it("SHOULD render with the split layout on wide screens", () => {
  givenViewModel({ isSplitLayout: true });

  render(<Home />);

  expect(screen.getByTestId("home-summary-loading")).toBeOnTheScreen();
  expect(screen.getByTestId("home-stock-loading")).toBeOnTheScreen();
});
