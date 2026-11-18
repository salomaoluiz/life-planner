import { fireEvent, render, screen } from "@tests";

import StockCatalog from "./";
import { useStockCatalogScreenViewModel } from "./hooks";
import stockCatalogScreenTestIds from "./testIds";

jest.mock("./hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

it("SHOULD explain the section and open the catalog sheet", () => {
  const vm = { onOpenCatalog: jest.fn() };

  jest.mocked(useStockCatalogScreenViewModel).mockReturnValue(vm as never);
  render(<StockCatalog />);

  expect(screen.getByText("stock.sections.catalogBody")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(stockCatalogScreenTestIds.open));
  expect(vm.onOpenCatalog).toHaveBeenCalled();
});
