import { screen } from "@tests";

import { setup, mocks, spies } from "./mocks/index.mocks";

it("SHOULD render loading state when fetching", () => {
  setup({ isFetching: true });

  const loadingText = screen.getByText("Loading...");
  expect(loadingText).toBeDefined();
});

it("SHOULD render family list when not fetching", () => {
  setup();

  const familyList = screen.getByTestId("family-list");
  const newFamilyButton = screen.getByTestId("new-family-button");

  expect(familyList).toBeDefined();
  expect(newFamilyButton).toBeDefined();
});

it("SHOULD call useFamilies hook", () => {
  setup();

  expect(spies.useFamilies).toHaveBeenCalledTimes(1);
});

it("SHOULD render family cards when families exist", () => {
  const mockFamilies = [
    { id: "1", name: "Family 1" },
    { id: "2", name: "Family 2" },
  ];
  
  setup({ families: mockFamilies });

  const familyList = screen.getByTestId("family-list");
  expect(familyList.props.data).toEqual(mockFamilies);
});

it("SHOULD use correct render function for family items", () => {
  setup();

  const familyList = screen.getByTestId("family-list");
  const mockItem = { id: "test", name: "Test Family" };
  
  const renderedItem = familyList.props.renderItem({ item: mockItem });
  
  expect(renderedItem.props.family).toEqual(mockItem);
  expect(renderedItem.props.refetchFamilies).toBe(mocks.useFamilies.refetch);
});