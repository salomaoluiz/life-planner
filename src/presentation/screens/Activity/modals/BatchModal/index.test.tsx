import { fireEvent, render, screen } from "@tests";

import BatchModal from "./";
import useBatchViewModel from "./hooks/useBatchViewModel";
import batchTestIds from "./testIds";

jest.mock("./hooks/useBatchViewModel");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const vm = {
  file: "extrato.csv",
  hasNext: true,
  header: {
    count: 128,
    dates: "01/10/2026 – 31/10/2026",
    existing: 126,
    sources: "Conta corrente",
    total: "−R$ 8.412,37",
  },
  isLoading: false,
  isLoadingMore: false,
  onClose: jest.fn(),
  onLoadMore: jest.fn(),
  onOpen: jest.fn(),
  onSearchChange: jest.fn(),
  owner: "Pessoal",
  rows: [
    {
      action: "CREATE",
      amount: "−R$ 23,50",
      canOpen: true,
      key: "k1",
      label: "Padaria",
      meta: "Conta · 31/10",
    },
    {
      action: "CREATE",
      amount: "−R$ 64,90",
      canOpen: false,
      key: "k2",
      label: "Farmácia",
      meta: "",
    },
  ],
  search: "",
  title: "importou 128",
  when: "Você · 21:08",
};

function setup(overrides: Record<string, unknown> = {}) {
  jest
    .mocked(useBatchViewModel)
    .mockReturnValue({ ...vm, ...overrides } as never);

  return render(<BatchModal />);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the summary, the items AND open an existing one", () => {
  setup();

  expect(screen.getByTestId(batchTestIds.existing)).toBeOnTheScreen();
  expect(screen.getByText("Padaria")).toBeOnTheScreen();
  expect(screen.getByText("activity.itemDeleted")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(`${batchTestIds.open}-0`));
  expect(vm.onOpen).toHaveBeenCalledWith(0);

  fireEvent.press(screen.getByTestId(batchTestIds.loadMore));
  expect(vm.onLoadMore).toHaveBeenCalled();
});

it("SHOULD show placeholders while loading AND no header", () => {
  setup({ header: null, isLoading: true, rows: [] });

  expect(screen.queryByTestId(batchTestIds.existing)).toBeNull();
});
