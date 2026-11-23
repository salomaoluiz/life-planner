import { fireEvent, render, screen } from "@tests";

import StartPurchaseModal from "./";
import { useStartPurchaseViewModel } from "./hooks";
import testIds from "./testIds";

jest.mock("./hooks");

function setup(overrides: Record<string, unknown> = {}) {
  const vm = {
    creatingMarket: false,
    failed: false,
    isLoading: false,
    listName: "Mercado",
    marketOptions: [
      { label: "Bom Preço", value: "m1" },
      { label: "+", value: "__new__" },
    ],
    name: "",
    neighborhood: "",
    onClose: jest.fn(),
    onJoin: jest.fn(),
    onMarketChange: jest.fn(),
    onNameChange: jest.fn(),
    onNeighborhoodChange: jest.fn(),
    onStart: jest.fn(),
    open: [
      {
        cartCount: 3,
        id: "p9",
        marketName: "Atacadão",
        purchase: { id: "p9" },
        startedBy: "Ana",
      },
    ],
    saving: false,
    selectedMarketId: "m1",
    ...overrides,
  };

  jest.mocked(useStartPurchaseViewModel).mockReturnValue(vm as never);

  return vm;
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD join an open purchase OR start another one", () => {
  const vm = setup();

  render(<StartPurchaseModal />);
  fireEvent.press(screen.getByTestId(`${testIds.join}-p9`));
  fireEvent.press(screen.getByTestId(testIds.submit));
  fireEvent.press(screen.getByTestId(testIds.cancel));

  expect(vm.onJoin).toHaveBeenCalledWith({ id: "p9" });
  expect(vm.onStart).toHaveBeenCalled();
  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD ask for the name of a new market AND disable start while it is empty", () => {
  const vm = setup({
    creatingMarket: true,
    open: [],
    selectedMarketId: "__new__",
  });

  render(<StartPurchaseModal />);
  fireEvent.changeText(screen.getByTestId(testIds.newMarketName), "Novo");
  fireEvent.changeText(
    screen.getByTestId(testIds.newMarketNeighborhood),
    "Centro",
  );
  fireEvent.press(screen.getByTestId(testIds.submit));

  expect(vm.onNameChange).toHaveBeenCalledWith("Novo");
  expect(vm.onNeighborhoodChange).toHaveBeenCalledWith("Centro");
  expect(vm.onStart).not.toHaveBeenCalled();
});

it("SHOULD show the failure banner AND the loading skeleton", () => {
  setup({ failed: true });
  const { unmount } = render(<StartPurchaseModal />);

  expect(screen.getByTestId(testIds.error)).toBeTruthy();
  unmount();

  setup({ isLoading: true });
  render(<StartPurchaseModal />);
  expect(screen.queryByTestId(testIds.submit)).toBeTruthy();
});
