import { screen } from "@tests";

import { setup, setupLoading } from "./mocks/index.mocks";

it("SHOULD render loading state when fetching", () => {
  setupLoading();

  expect(screen.getByTestId("loading-title")).toBeDefined();
});

it("SHOULD render stock list when data is available", () => {
  setup();

  expect(screen.getByTestId("stock-container")).toBeDefined();
  expect(screen.getByTestId("flash-list")).toBeDefined();
  expect(screen.getByTestId("fab")).toBeDefined();
});

it("SHOULD render FlashList with correct data", () => {
  setup();

  const flashList = screen.getByTestId("flash-list");
  expect(flashList.props.data).toBeDefined();
  expect(flashList.props.renderItem).toBeDefined();
});

it("SHOULD render Fab with plus icon", () => {
  setup();

  const fab = screen.getByTestId("fab");
  expect(fab.props.icon).toBe("plus");
});

it("SHOULD call router push when fab is pressed", () => {
  const mockPush = jest.fn();
  jest.mocked(require("expo-router").router.push).mockImplementation(mockPush);
  
  setup();

  const fab = screen.getByTestId("fab");
  fab.props.onPress();

  expect(mockPush).toHaveBeenCalledWith({
    pathname: "/stock/add_new_stock_item",
  });
});