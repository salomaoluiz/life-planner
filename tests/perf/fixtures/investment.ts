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

// Spec 109: the home section answer (API shape).
const investmentsSummary = {
  currency: "BRL",
  currentValueCents: 1263600,
  hasPositions: true,
  income: { count: 0, month: "2026-11", pendingSuggestions: 0, totalCents: 0 },
  investedCents: 1178640,
  nextMaturity: null,
  quotes: { asOf: null, manualCount: 1, stale: false, withoutPrice: 0 },
  resultBasisPoints: 721,
  resultCents: 84960,
};

// Spec 110: the investments overview, one asset and one month of data.
const investmentsDashboard = {
  allocation: [{ assetClass: "BR_STOCK", share: 1, value: 120000 }],
  incomes: [
    {
      byType: { DIVIDEND: 1, INTEREST: 0, JCP: 0, OTHER: 0, YIELD: 0 },
      date: "2026-11-30",
      planned: 0,
      received: 5000,
    },
  ],
  period: { bucket: "MONTH", from: "2025-12-01", to: "2026-11-04" },
  ranking: [
    {
      assetClass: "BR_STOCK",
      assetId: "asset-1",
      currency: "BRL",
      name: "Itausa PN",
      openResult: 20000,
      openResultPercent: 0.2,
      share: 1,
      ticker: "ITSA4",
      value: 120000,
      valueKind: "QUOTE",
    },
  ],
  series: [{ date: "2026-11-04", invested: 100000, marketValue: 120000 }],
  summary: {
    assetsWithoutValue: 0,
    currentValue: 120000,
    historyStartsAt: null,
    incomePlanned: 0,
    incomeReceived: 5000,
    invested: 100000,
    openResult: 20000,
    openResultPercent: 0.2,
    operationsWithoutFxRate: 0,
    realizedResult: 0,
    salesCount: 0,
    staleQuotes: 0,
  },
};

// Spec 113: the stored market indexes and the history of one of them (API shape).
const marketIndexes = {
  cdi: {
    annual: "14.90",
    daily: "0.05513100",
    date: "2026-11-11",
    followers: 1,
    lastChangeDate: "2026-06-18",
    stale: false,
  },
  fx: [{ pair: "USD-BRL", quotedAt: "2026-11-12T11:05:00Z", rate: "5.350000" }],
  ipca: {
    accumulated12m: "4.68",
    expected12m: "4.20",
    expectedDate: "2026-11-11",
    followers: 0,
    month: "2026-10",
    monthly: "0.32",
    stale: false,
  },
  lastSuccessAt: "2026-11-12T13:10:00Z",
  selic: {
    daily: "0.05546000",
    date: "2026-11-11",
    followers: 0,
    lastChangeDate: "2026-06-18",
    stale: false,
    target: "15.00",
  },
};
const marketIndexHistory = {
  changes: [{ delta: "0.75", since: "2026-06-18", value: "14.90" }],
  followers: [{ assetId: "asset-1", name: "CDB", percent: "110" }],
  index: "CDI",
  points: [{ date: "2026-06-18", value: "14.90" }],
};

export {
  investmentAsset,
  investmentDetail,
  investmentsDashboard,
  investmentsSummary,
  marketIndexes,
  marketIndexHistory,
  position,
};
