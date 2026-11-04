import { accountRow, largeAccountRows, overview } from "./fixtures/finance";
import { me } from "./fixtures/user";
import type { Method } from "./networkHarness";

const history = largeAccountRows();
// Spec 079: transaction responses are lean; the entities they reference come once in `lookups`.
const lookups = { categories: {}, tags: {} };

// Answers the HTTP calls of every module with fake data; unknown GETs answer an empty list.
function respond(method: Method, path: string): unknown {
  if (method !== "GET") {
    if (method === "POST" && path.startsWith("/v1/finance/transactions")) {
      return { item: { ...accountRow, id: "created-id" }, lookups };
    }

    return method === "POST" ? { ...accountRow, id: "created-id" } : {};
  }
  if (path === "/v1/user/me") {
    return me;
  }
  // One transaction by id (spec 077).
  if (/^\/v1\/finance\/transactions\/[^/?]+(\?|$)/.test(path)) {
    return { item: accountRow, lookups };
  }
  // The month of the transactions screen in one answer (spec 080).
  if (path.startsWith("/v1/finance/month")) {
    return {
      dailyBalances: { accounts: [], days: [], month: "2026-11" },
      invoices: [],
      lookups,
      month: "2026-11",
      projections: [],
      rows: { items: [accountRow], nextCursor: null },
      summary: {
        currency: "BRL",
        expense: 0,
        income: 0,
        projectedExpense: 0,
        projectedIncome: 0,
        toPay: 0,
        toReceive: 0,
      },
    };
  }
  if (path.startsWith("/v1/finance/transactions")) {
    // The API answers in keyset pages (spec 078).
    if (path.includes("source=CARD")) {
      return { items: [], lookups, nextCursor: null };
    }

    return {
      items: path.includes("from=") ? [accountRow] : history,
      lookups,
      nextCursor: null,
    };
  }
  if (path.startsWith("/v1/finance/accounts/daily-balances")) {
    return {};
  }
  if (path.startsWith("/v1/finance/credit-cards/overview")) {
    return overview;
  }

  return [];
}

export default respond;
