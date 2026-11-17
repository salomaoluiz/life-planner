// Spec 102: every investment query key lives here, under one root, so a write invalidates exactly the screens it moves.
type Key = string[];

const ROOT = "investment";

export const investmentKeys = {
  all: (): Key => [ROOT],
  asset: (id: string): Key => [ROOT, "asset", id],
  assets: (status: string): Key => [ROOT, "assets", status],
  dashboard: (key: string): Key => [ROOT, "dashboard", key],
  fixedIncomePreview: (id: string, key: string): Key => [
    ROOT,
    "fixed-income-preview",
    id,
    key,
  ],
  fixedIncomeSimulation: (key: string): Key => [
    ROOT,
    "fixed-income-simulation",
    key,
  ],
  homeSummary: (ownersKey: string): Key => [ROOT, "home-summary", ownersKey],
  marketIndexes: (): Key => [ROOT, "market-indexes"],
  marketIndexHistory: (index: string, from: string, to: string): Key => [
    ROOT,
    "market-index-history",
    index,
    from,
    to,
  ],
  priceHistory: (id: string, range: string): Key => [
    ROOT,
    "price-history",
    id,
    range,
  ],
  tickerSearch: (market: string, q: string): Key => [
    ROOT,
    "ticker-search",
    market,
    q,
  ],
};
