import { Datasources } from "@data/datasource";
import { PurchaseRepository } from "@domain/repositories/stock/purchaseRepository";

// Spec 120: the screens read through React Query and the shopping mode writes through the offline queue, so these
// only forward to the API datasource.
export function purchaseRepositoryImpl(
  datasources: Datasources,
): PurchaseRepository {
  const stock = datasources.stockDatasource;

  return {
    addPurchaseRowByCode: async (params) => stock.addPurchaseRowByCode(params),
    changePurchaseStatus: async (params) => stock.changePurchaseStatus(params),
    closePurchase: async (params) => stock.closePurchase(params),
    closingLock: async (params) => stock.closingLock(params),
    createMarket: async (params) => stock.createMarket(params),
    deleteClosedPurchase: async (id) => stock.deleteClosedPurchase(id),
    deletePurchaseRow: async (params) => stock.deletePurchaseRow(params),
    getClosePreview: async (params) => stock.getClosePreview(params),
    getItemPrices: async (params) => stock.getItemPrices(params),
    getListPurchases: async (params) => stock.getListPurchases(params),
    getMarkets: async (params) => stock.getMarkets(params),
    getPendingPurchases: async () => stock.getPendingPurchases(),
    getPurchase: async (id) => stock.getPurchase(id),
    mergePurchase: async (params) => stock.mergePurchase(params),
    startPurchase: async (params) => stock.startPurchase(params),
    updateClosedPurchase: async (params) => stock.updateClosedPurchase(params),
    upsertPurchaseRow: async (params) => stock.upsertPurchaseRow(params),
  };
}
