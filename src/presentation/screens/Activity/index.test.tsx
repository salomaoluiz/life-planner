import { fireEvent, render, screen } from "@tests";

import Activity from "./";
import useActivityViewModel from "./hooks/useActivityViewModel";
import activityTestIds from "./testIds";

jest.mock("./hooks/useActivityViewModel");
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");

  return {
    FlashList: ({
      data,
      ListEmptyComponent,
      ListFooterComponent,
      ListHeaderComponent,
      renderItem,
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListFooterComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { index: number; item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList">
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ index, item })}</MockView>
        ))}
        {ListFooterComponent}
      </MockView>
    ),
  };
});
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const baseRow = {
  assetId: undefined,
  batchCount: 0,
  diffs: [{ field: "Valor", from: "R$ 2.300,00", to: "R$ 2.450,00" }],
  fileName: undefined,
  gone: false,
  icon: "pencil-outline",
  id: "a-1",
  isBatch: false,
  label: "Aluguel",
  meta: "Conta corrente",
  metaWarning: false,
  ownerLabel: "Família",
  ownerName: "Família",
  target: { modal: "add_new_transaction", params: { id: "t-1" } },
  time: "09:15",
  tone: "accent",
  verb: "editou a transação",
  who: "Ana",
};
const vm = {
  actorChoices: [],
  days: [
    {
      key: "2026-11-27",
      label: "Hoje",
      rows: [
        baseRow,
        { ...baseRow, gone: true, id: "a-2", target: null },
        { ...baseRow, id: "a-3", isBatch: true, target: null },
      ],
    },
  ],
  errorKey: undefined as string | undefined,
  filterCount: 0,
  filters: {
    action: "all",
    actorId: "all",
    ownerId: "all",
    period: "30d",
    q: "",
  },
  hasFamily: true,
  hasNext: true,
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
  ownerChoices: [{ label: "Família", value: "f-1" }],
  search: "",
  sheetOpen: false,
};

function setup(overrides: Record<string, unknown> = {}) {
  jest
    .mocked(useActivityViewModel)
    .mockReturnValue({ ...vm, ...overrides } as never);

  return render(<Activity />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD list the entries with the diff, open an item, view a batch AND mark a deleted item", () => {
  setup();

  expect(screen.getByTestId(activityTestIds.screen)).toBeOnTheScreen();
  expect(screen.getByText("Hoje")).toBeOnTheScreen();
  expect(screen.getAllByText("R$ 2.300,00")[0]).toBeOnTheScreen();
  expect(screen.getAllByText("R$ 2.450,00")[0]).toBeOnTheScreen();
  expect(screen.getByText("activity.itemDeleted")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(`${activityTestIds.open}-a-1`));
  expect(vm.onOpen).toHaveBeenCalledWith(baseRow);

  fireEvent.press(screen.getByTestId(`${activityTestIds.viewItems}-a-3`));
  expect(vm.onViewItems).toHaveBeenCalled();
});

it("SHOULD load more, search AND change the filters", () => {
  setup();

  fireEvent.press(screen.getByTestId(activityTestIds.loadMore));
  expect(vm.onLoadMore).toHaveBeenCalled();

  fireEvent.changeText(
    screen.getByPlaceholderText("activity.search"),
    "mercado",
  );
  expect(vm.onSearchChange).toHaveBeenCalledWith("mercado");
});

it("SHOULD show the empty state with the clear action", () => {
  setup({ days: [], hasNext: false, isEmpty: true });

  fireEvent.press(screen.getByText("activity.empty.clear"));

  expect(screen.getByTestId(activityTestIds.emptyState)).toBeOnTheScreen();
  expect(vm.onClearFilters).toHaveBeenCalled();
});

it("SHOULD show the skeleton while loading AND the error with a retry", () => {
  const loading = setup({ days: [], isLoading: true });

  expect(screen.getAllByTestId("activity-skeleton").length).toBeGreaterThan(0);
  loading.unmount();

  setup({ errorKey: "activity.error" });
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});
