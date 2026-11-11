import { fireEvent, render, screen } from "@tests";
import "@shopify/flash-list/jestSetup";

import ProfileButton from "@screens/Navigation/containers/ProfileButton";

import Home from "./";
import { useHomeViewModel } from "./hooks";
import homeTestIds from "./testIds";

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
    balance: state,
    canAddInvestmentAsset: true,
    currency: {
      onChange: jest.fn(),
      options: ["BRL"],
      value: "BRL",
      visible: false,
    },
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
    investments: state,
    isRefreshing: false,
    isSplitLayout: false,
    lowest: state,
    onAddStockItemPress: jest.fn(),
    onAddTransactionPress: jest.fn(),
    onCreateAccountPress: jest.fn(),
    onInvestmentsAddAssetPress: jest.fn(),
    onInvestmentsMaturityPress: jest.fn(),
    onInvestmentsPress: jest.fn(),
    onInvestmentsSuggestionsPress: jest.fn(),
    onInvoicePress: jest.fn(),
    onOverviewPress: jest.fn(),
    onRefresh: jest.fn(),
    onStockSeeAllPress: jest.fn(),
    onUpcomingItemPress: jest.fn(),
    onUpcomingSeeAllPress: jest.fn(),
    stock: state,
    upcoming: state,
    ...overrides,
  } as never);
}

it("SHOULD render the header, the filter and the Finance, Investments and Stock sections", () => {
  givenViewModel();

  render(<Home />);

  expect(screen.getByText("Saturday, October 3")).toBeOnTheScreen();
  expect(
    screen.getByText('home.greeting.morning {"name":"Ana"}'),
  ).toBeOnTheScreen();
  expect(screen.getByTestId("home-filter-ALL")).toBeOnTheScreen();
  expect(
    screen.getByTestId(homeTestIds.financeBalanceLoading),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(homeTestIds.financeLowestLoading),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(homeTestIds.financeUpcomingLoading),
  ).toHaveLength(3);
  expect(screen.getByTestId(homeTestIds.investmentsLoading)).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(homeTestIds.stockAttentionLoading).length,
  ).toBeGreaterThan(0);
});

// The testIDs of the tree in document order.
function testIdsInOrder(node: unknown, found: string[] = []): string[] {
  if (Array.isArray(node)) {
    node.forEach((child) => testIdsInOrder(child, found));
  } else if (node && typeof node === "object") {
    const { children, props } = node as {
      children?: unknown;
      props?: { testID?: string };
    };

    if (props?.testID) found.push(props.testID);
    testIdsInOrder(children, found);
  }

  return found;
}

it("SHOULD show the Investments section between Finance and Stock (spec 109)", () => {
  givenViewModel();

  render(<Home />);

  const ids = testIdsInOrder(screen.toJSON());
  const finance = ids.indexOf(homeTestIds.financeSection);
  const investments = ids.indexOf(homeTestIds.investmentsSection);
  const stock = ids.indexOf(homeTestIds.stockSection);

  expect(finance).toBeGreaterThanOrEqual(0);
  expect(investments).toBeGreaterThan(finance);
  expect(stock).toBeGreaterThan(investments);
});

it("SHOULD open the investments module from the section link (spec 109)", () => {
  const onInvestmentsPress = jest.fn();
  givenViewModel({ onInvestmentsPress });

  render(<Home />);
  fireEvent.press(
    screen.getByTestId(`${homeTestIds.investmentsSection}-action`),
  );

  expect(onInvestmentsPress).toHaveBeenCalledTimes(1);
});

it("SHOULD expose the screen testID used by the E2E flows", () => {
  givenViewModel();

  render(<Home />);

  expect(screen.getByTestId(homeTestIds.screen)).toBeOnTheScreen();
});

it("SHOULD show an error only in the failed block", () => {
  givenViewModel({
    stock: { ...state, isError: true, isLoading: false },
    upcoming: { ...state, isError: true, isLoading: false },
  });

  render(<Home />);

  expect(
    screen.getAllByTestId(homeTestIds.stockAttentionError).length,
  ).toBeGreaterThan(0);
  expect(
    screen.getByTestId(homeTestIds.financeBalanceLoading),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(homeTestIds.financeUpcomingError),
  ).toBeOnTheScreen();
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

  expect(
    screen.getByTestId(homeTestIds.financeBalanceLoading),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByTestId(homeTestIds.stockAttentionLoading).length,
  ).toBeGreaterThan(0);
});

it("SHOULD order the sections Finance then Stock and no longer list the latest transactions", () => {
  givenViewModel();

  render(<Home />);

  expect(screen.getByTestId(homeTestIds.financeSection)).toBeOnTheScreen();
  expect(screen.getByTestId(homeTestIds.stockSection)).toBeOnTheScreen();
  expect(screen.queryByText("home.transactions.title")).not.toBeOnTheScreen();
});

it("SHOULD open the Overview from the section link", () => {
  const onOverviewPress = jest.fn();

  givenViewModel({ onOverviewPress });

  render(<Home />);
  fireEvent.press(screen.getByTestId(`${homeTestIds.financeSection}-action`));

  expect(onOverviewPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the currency dropdown only WHEN there are accounts in more than one currency (spec 103)", () => {
  const onChange = jest.fn();

  givenViewModel();
  const { unmount } = render(<Home />);
  expect(screen.queryByTestId(homeTestIds.financeCurrency)).toBeNull();
  unmount();

  givenViewModel({
    currency: {
      onChange,
      options: ["BRL", "USD"],
      value: "BRL",
      visible: true,
    },
  });
  render(<Home />);

  fireEvent.press(screen.getByTestId(homeTestIds.financeCurrency));
  fireEvent.press(screen.getByText("USD"));

  expect(onChange).toHaveBeenCalledWith("USD");
});
