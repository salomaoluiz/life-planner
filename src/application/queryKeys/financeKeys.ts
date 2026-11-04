// Spec 076: every finance query key is built here, under one root, so a write can invalidate or patch exactly the
// queries it moves. A key is a path: the resource, a shape (`list` is the composed shape a screen caches, `raw` is the
// use-case output the forms cache, spec 015), then whatever narrows it (a month, owner ids...).
type Key = string[];
type Scope = "home" | "screen";

const ROOT = "finance";

// Keyed by month first, so one prefix selects the month for every screen and scope that caches it.
function monthly(name: string) {
  return {
    all: (): Key => [ROOT, name],
    monthPrefix: (month: string): Key => [ROOT, name, month],
    ofMonth: (month: string, scope: Scope, ...rest: string[]): Key => [
      ROOT,
      name,
      month,
      scope,
      ...rest,
    ],
  };
}

function resource(name: string) {
  return {
    all: (): Key => [ROOT, name],
    list: (...rest: string[]): Key => [ROOT, name, "list", ...rest],
    raw: (...rest: string[]): Key => [ROOT, name, "raw", ...rest],
  };
}

const accounts = resource("accounts");
const categories = resource("categories");
const creditCards = resource("credit-cards");
const creditCardsOverview = resource("credit-cards-overview");
const installmentPlans = resource("installment-plans");
const invoice = resource("invoice");
const invoices = resource("invoices");
const projections = resource("projections");
const recurrences = resource("recurrences");
const tags = resource("tags");
const transactions = resource("transactions");
const transactionsFiltered = resource("transactions-filtered");
const upcoming = resource("upcoming");
const dailyBalances = monthly("daily-balances");
const summary = monthly("summary");

const financeKeys = {
  accounts,
  all: (): Key => [ROOT],
  categories,
  creditCards,
  creditCardsOverview,
  dailyBalances,
  installmentPlans,
  // What a finance write marks stale when it cannot say more (account, category, tag, card writes, payments).
  invalidationRoots: (): Key[] =>
    [
      transactions,
      transactionsFiltered,
      invoices,
      invoice,
      projections,
      summary,
      dailyBalances,
      accounts,
      creditCards,
      creditCardsOverview,
      installmentPlans,
      recurrences,
      categories,
      tags,
    ].map((entry) => entry.all()),
  invoice,
  invoices,
  projections,
  recurrences,
  summary,
  tags,
  transactions,
  transactionsFiltered,
  upcoming,
};

// `YYYY-MM` of an ISO date or `YYYY-MM-DD`: a slice, never a `Date`, so the timezone cannot move the month.
function monthKeyOfDate(date: string) {
  return date.slice(0, 7);
}

export type { Scope };
export { financeKeys, monthKeyOfDate };
