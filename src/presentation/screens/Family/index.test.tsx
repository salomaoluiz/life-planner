import { mocks, screen, setup } from "./mocks/screen.mocks";

it("SHOULD render the loading text WHEN fetching", () => {
  setup({ isFetching: true });

  expect(screen.getByText("Loading...")).toBeOnTheScreen();
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
  expect(screen.queryByTestId("newFamilyButton")).not.toBeOnTheScreen();
});

it("SHOULD render a card per family and the new family button", () => {
  setup({ families: mocks.families });

  const cards = screen.getAllByTestId("familyCard");
  expect(cards).toHaveLength(1);
  expect(cards[0].props.family).toBe(mocks.families[0]);
  expect(screen.getByTestId("newFamilyButton")).toBeOnTheScreen();
});

it("SHOULD pass refetch to every family card", () => {
  const { refetch } = setup({ families: mocks.families });

  expect(screen.getAllByTestId("familyCard")[0].props.refetchFamilies).toBe(
    refetch,
  );
});

it("SHOULD render an empty list WHEN there are no families", () => {
  setup();

  expect(screen.getByTestId("flashList")).toBeOnTheScreen();
  expect(screen.queryAllByTestId("familyCard")).toHaveLength(0);
  expect(screen.getByTestId("newFamilyButton")).toBeOnTheScreen();
});
