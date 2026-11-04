import { accountRow, largeAccountRows, overview } from "./fixtures/finance";
import { me } from "./fixtures/user";
import type { Method } from "./networkHarness";

const history = largeAccountRows();

// Answers the HTTP calls of every module with fake data; unknown GETs answer an empty list.
function respond(method: Method, path: string): unknown {
  if (method !== "GET") {
    return method === "POST" ? { ...accountRow, id: "created-id" } : {};
  }
  if (path === "/v1/user/me") {
    return me;
  }
  // One transaction by id (spec 077).
  if (/^\/v1\/finance\/transactions\/[^/?]+(\?|$)/.test(path)) {
    return accountRow;
  }
  if (path.startsWith("/v1/finance/transactions")) {
    // The API answers in keyset pages (spec 078).
    if (path.includes("source=CARD")) {
      return { items: [], nextCursor: null };
    }

    return {
      items: path.includes("from=") ? [accountRow] : history,
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
