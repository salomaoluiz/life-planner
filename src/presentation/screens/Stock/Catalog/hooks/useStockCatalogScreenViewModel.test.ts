import { renderHook } from "@testing-library/react-native";

import { modalNavigation } from "@tests/modalNavigation";

import useStockCatalogScreenViewModel from "./useStockCatalogScreenViewModel";

it("SHOULD open the catalog sheet", () => {
  const { result } = renderHook(() => useStockCatalogScreenViewModel());

  result.current.onOpenCatalog();

  expect(modalNavigation.openModal).toHaveBeenCalledWith("stock_catalog");
});
