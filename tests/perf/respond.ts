import { accountRow, largeAccountRows, overview } from "./fixtures/finance";
import {
  investmentAsset,
  investmentDetail,
  investmentsDashboard,
  investmentsSummary,
  marketIndexes,
  marketIndexHistory,
} from "./fixtures/investment";
import { purchaseView, stockDetail } from "./fixtures/stock";
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
  // Spec 113: the stored indexes and the history of one.
  if (/^\/v1\/investments\/market-indexes\/[A-Z]+\/history/.test(path)) {
    return marketIndexHistory;
  }
  if (path.startsWith("/v1/investments/market-indexes")) {
    return marketIndexes;
  }
  // Spec 110: the investments overview.
  if (path.startsWith("/v1/investments/dashboard")) {
    return investmentsDashboard;
  }
  // Spec 109: the home section.
  if (path.startsWith("/v1/investments/summary")) {
    return investmentsSummary;
  }
  // Investments (spec 102): the detail of one asset, else the list.
  if (/^\/v1\/investments\/assets\/[^/?]+(\?|$)/.test(path)) {
    return { item: investmentDetail };
  }
  if (path.startsWith("/v1/investments/assets")) {
    return { items: [investmentAsset] };
  }
  // Spec 124: the bell, the center, the preferences and the devices.
  if (path.startsWith("/v1/notifications/unread-count")) {
    return { count: 3 };
  }
  if (path.startsWith("/v1/notifications/summary-preview")) {
    return { count: 0, hasItems: false };
  }
  if (path.startsWith("/v1/notifications/preferences")) {
    return {
      billLeadDays: 3,
      families: [],
      invoiceLeadDays: 3,
      locale: "pt-BR",
      quietEnd: "07:00",
      quietStart: "22:00",
      summaryTime: "08:00",
      tickMinutes: 15,
      timeZone: "America/Sao_Paulo",
      types: {
        FINANCE_BILL_DUE: true,
        FINANCE_INVOICE_DUE: true,
        STOCK_EXPIRING: true,
        STOCK_OPENED_EXPIRING: true,
      },
    };
  }
  if (path.startsWith("/v1/notifications/devices")) {
    return { items: [] };
  }
  if (path.startsWith("/v1/notifications")) {
    return { items: [], nextCursor: null };
  }
  // Spec 120: markets, the pending purchases, one purchase and the closing preview.
  if (path.startsWith("/v1/stock/markets")) {
    return { items: [] };
  }
  if (path.startsWith("/v1/stock/purchases/pending")) {
    return { items: [] };
  }
  if (/^\/v1\/stock\/purchases\/[^/?]+\/close-preview/.test(path)) {
    return {
      expirations: [],
      financeParts: null,
      missingPrices: [],
      needsDefaultFinanceCategory: false,
      newItems: [],
      unknownWeight: [],
    };
  }
  if (/^\/v1\/stock\/purchases\/[^/?]+(\?|$)/.test(path)) {
    return purchaseView;
  }
  // Spec 118: the restock summary, the lists, one list and the rows.
  if (path.startsWith("/v1/stock/shopping-lists/restock-summary")) {
    return { count: 0, groups: [], totals: [] };
  }
  if (/^\/v1\/stock\/shopping-lists\/[^/?]+(\?|$)/.test(path)) {
    return {
      groups: [],
      list: {
        currency: "BRL",
        id: "list-1",
        isDefault: true,
        name: "Mercado",
        owner: "USER",
        ownerId: "user-1",
        status: "ACTIVE",
      },
      totals: {
        autoCount: 0,
        estimatedTotalCents: 0,
        pricedCount: 0,
        rowCount: 0,
      },
    };
  }
  if (path.startsWith("/v1/stock/shopping-lists")) {
    return { items: [] };
  }
  // Spec 117: one location (the QR route header).
  if (/^\/v1\/stock\/locations\/[^/?]+$/.test(path)) {
    return {
      id: "location-1",
      itemCount: 3,
      name: "Pantry",
      owner: "USER",
      ownerId: "user-1",
      status: "ACTIVE",
    };
  }
  // Stock (spec 116): categories, locations, suggestions, the history and the detail of one item.
  if (
    path.startsWith("/v1/stock/categories") ||
    path.startsWith("/v1/stock/locations") ||
    path.startsWith("/v1/stock/items/frequent") ||
    path.startsWith("/v1/stock/items/suggestions")
  ) {
    return { items: [] };
  }
  if (/^\/v1\/stock\/items\/[^/?]+\/movements/.test(path)) {
    return { items: [], nextCursor: null };
  }
  if (/^\/v1\/stock\/items\/[^/?]+(\?|$)/.test(path)) {
    return stockDetail;
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
