import "@shopify/flash-list/jestSetup";

import { fireEvent, render, screen } from "@tests";

import { useFamilyViewModel } from "@screens/Family/hooks";
import { familyNamed } from "@screens/Family/mocks/index.mocks";

import Family from "./index";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@screens/Family/hooks", () => ({ useFamilyViewModel: jest.fn() }));
jest.mock("@screens/Family/containers", () => {
  const { View: MockView } = jest.requireActual("react-native");

  return {
    FamilyCard: (props: {
      expanded: boolean;
      family: { familyId: string };
      onToggle: () => void;
    }) => (
      <MockView
        expanded={props.expanded}
        onToggle={props.onToggle}
        testID={`card-${props.family.familyId}`}
      />
    ),
  };
});

type Vm = ReturnType<typeof useFamilyViewModel>;

function setup(overrides: Partial<Vm> = {}) {
  const vm = {
    count: 2,
    families: [familyNamed("1", "Alpha"), familyNamed("2", "Beta")],
    isExpanded: jest.fn((id: string) => id === "1"),
    onNewFamily: jest.fn(),
    onRefresh: jest.fn(),
    onRetry: jest.fn(),
    onToggle: jest.fn(),
    refreshing: false,
    status: "ready",
    subtitleKey: "family.list.subtitle_other",
    ...overrides,
  } as Vm;
  jest.mocked(useFamilyViewModel).mockReturnValue(vm);

  render(<Family />);

  return vm;
}

it("SHOULD render the header AND open the new family form from the plus button", () => {
  const vm = setup();

  expect(screen.getByText("family.list.title")).toBeOnTheScreen();
  expect(
    screen.getByText('family.list.subtitle_other {"count":2}'),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId("family-new"));

  expect(vm.onNewFamily).toHaveBeenCalledTimes(1);
});

it("SHOULD render one card per family with expansion AND toggle bound to the id", () => {
  const vm = setup();

  expect(screen.getByTestId("card-1").props.expanded).toBe(true);
  expect(screen.getByTestId("card-2").props.expanded).toBe(false);

  screen.getByTestId("card-2").props.onToggle();

  expect(vm.onToggle).toHaveBeenCalledWith("2");
});

it("SHOULD render two skeleton cards WHEN loading", () => {
  setup({ families: [], status: "loading" });

  expect(screen.getByTestId("family-skeleton-0")).toBeOnTheScreen();
  expect(screen.getByTestId("family-skeleton-1")).toBeOnTheScreen();
});

it("SHOULD render the error state AND retry", () => {
  const vm = setup({ families: [], status: "error" });

  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(screen.getByTestId("family-error")).toBeOnTheScreen();
  expect(vm.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state WITHOUT subtitle AND create from its action", () => {
  const vm = setup({ families: [], status: "empty" });

  expect(screen.queryByText(/family.list.subtitle/)).toBeNull();

  fireEvent.press(screen.getByText("family.empty.action"));

  expect(vm.onNewFamily).toHaveBeenCalledTimes(1);
});
