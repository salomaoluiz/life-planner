import { fireEvent, render, screen } from "@tests";

import activityTestIds from "../testIds";
import Compact from "./Compact";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");

  return {
    FlashList: ({
      ListHeaderComponent,
    }: {
      ListHeaderComponent?: React.ReactNode;
    }) => <MockView testID="flashList">{ListHeaderComponent}</MockView>,
  };
});

const vm = {
  actorChoices: [],
  days: [{ key: "d", label: "Hoje", rows: [{ id: "a" }, { id: "b" }] }],
  errorKey: undefined,
  filterCount: 2,
  filters: {
    action: "all",
    actorId: "all",
    ownerId: "all",
    period: "30d",
    q: "",
  },
  hasFamily: false,
  hasNext: false,
  isEmpty: false,
  isLoading: false,
  isLoadingMore: false,
  module: "FINANCE",
  onActionChange: jest.fn(),
  onActorChange: jest.fn(),
  onClearFilters: jest.fn(),
  onLoadMore: jest.fn(),
  onModuleChange: jest.fn(),
  onOpen: jest.fn(),
  onOwnerChange: jest.fn(),
  onPeriodChange: jest.fn(),
  onRetry: jest.fn(),
  onSearchChange: jest.fn(),
  onSheetClose: jest.fn(),
  onSheetOpen: jest.fn(),
  onViewItems: jest.fn(),
  ownerChoices: [],
  search: "",
  sheetOpen: true,
};

beforeEach(() => jest.clearAllMocks());

it("SHOULD open the filters sheet, count the actions AND clear or apply", () => {
  render(<Compact vm={vm as never} />);

  expect(screen.getByTestId(activityTestIds.filterButton)).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(activityTestIds.filterButton));
  expect(vm.onSheetOpen).toHaveBeenCalled();

  fireEvent.press(screen.getByTestId(activityTestIds.clearFilters));
  expect(vm.onClearFilters).toHaveBeenCalled();
});
