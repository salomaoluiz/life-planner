import { buildModalPath } from "@screens/Navigation/models/modalPath";

export interface NoticeTarget {
  params?: Record<string, string>;
  pathname: string;
}

const STOCK_ITEM = /^\/stock\/items\/([^/?]+)(?:\?(.*))?$/;
const TRANSACTION = /^\/finance\/transactions\/([^/?]+)$/;
const INVOICE = /^\/credit-cards\/([^/]+)\/invoices\/(\d{4}-\d{2})$/;
const OCCURRENCE = /^\/finance\/recurrences\//;

// Spec 124 FR 20: the `route` of a notice item is a stable backend path; the app opens its own screen for it.
// The stock item and the transaction open their modal over their section, an invoice its detail, and a projected
// occurrence (no screen of its own) the transactions list. Anything else lands on the notice center.
export function resolveNoticeTarget(route: string): NoticeTarget {
  const stock = STOCK_ITEM.exec(route);

  if (stock) {
    const query = new URLSearchParams(stock[2] ?? "");
    const ownerId = query.get("ownerId");

    return {
      params: { itemId: stock[1], ...(ownerId ? { ownerId } : {}) },
      pathname: buildModalPath("/stock", "add_new_stock_item"),
    };
  }

  const transaction = TRANSACTION.exec(route);

  if (transaction) {
    return {
      params: { id: transaction[1] },
      pathname: buildModalPath("/financial/transaction", "add_new_transaction"),
    };
  }

  const invoice = INVOICE.exec(route);

  if (invoice) {
    return {
      params: { cardId: invoice[1], month: invoice[2] },
      pathname: buildModalPath("/financial/cards", "invoice_detail"),
    };
  }

  return {
    pathname: OCCURRENCE.test(route)
      ? "/financial/transaction"
      : "/notifications",
  };
}
