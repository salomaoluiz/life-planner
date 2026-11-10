// Spec 102: raw API answers of the investment endpoints.
const position = {
  averagePrice: "9.82200000",
  cost: 1178640,
  currentUnitPrice: "10.53",
  currentValue: 1263600,
  currentValueDate: "2026-11-01",
  openResult: 84960,
  openResultPercent: 0.0721,
  quantity: "1200",
  realizedResult: 31790,
};

const investmentAsset = {
  archivedAt: null,
  assetClass: "BR_STOCK",
  currency: "BRL",
  id: "asset-1",
  name: "Itaúsa PN",
  operationCount: 1,
  owner: "USER",
  ownerId: "8a6e0804-2bd0-4672-b79d-d97027f9071a",
  position,
  status: "ACTIVE",
  ticker: "ITSA4",
};

const investmentDetail = {
  ...investmentAsset,
  operations: [
    {
      accountId: null,
      costRemoved: null,
      date: "2026-06-10",
      fees: [],
      feesTotal: 0,
      generateTransaction: false,
      gross: 1178640,
      id: "op-1",
      quantity: "1200",
      realizedResult: null,
      total: 1178640,
      transactionId: null,
      type: "BUY",
      unitPrice: "9.822",
    },
  ],
  valuations: [
    { date: "2026-11-01", id: "val-1", source: "MANUAL", unitPrice: "10.53" },
  ],
};

export { investmentAsset, investmentDetail, position };
