import useModalNavigation from "@screens/Navigation/hooks/useModalNavigation";

export type StockCatalogScreenVM = ReturnType<
  typeof useStockCatalogScreenViewModel
>;

export default useStockCatalogScreenViewModel;

// Spec 118 FR 25: "Categorias e locais" is a section of the stock menu; the editor stays the existing catalog sheet.
function useStockCatalogScreenViewModel() {
  const { openModal } = useModalNavigation();

  return { onOpenCatalog: () => openModal("stock_catalog") };
}
