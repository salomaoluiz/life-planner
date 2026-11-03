import { api } from "@infrastructure/api";

// Spec 078: the API answers a list in keyset pages; every window the app asks for is read page by page.
export const TRANSACTIONS_PAGE_SIZE = 200;

interface TransactionsPage {
  items: Record<string, unknown>[];
  nextCursor: null | string;
}

// `path` is the list URL with its query. It must carry a period (`from`+`to`) or an `invoiceMonth`: the API refuses an
// unbounded list, and the app never builds one.
async function fetchTransactionPages(
  path: string,
): Promise<Record<string, unknown>[]> {
  const query = new URLSearchParams(path.split("?")[1] ?? "");
  const hasPeriod = query.has("from") && query.has("to");

  if (!hasPeriod && !query.has("invoiceMonth")) {
    throw new Error("The transactions list URL needs a period");
  }

  const rows: Record<string, unknown>[] = [];
  let cursor: null | string = null;

  do {
    const page: TransactionsPage = await api.get<TransactionsPage>(
      `${path}&limit=${TRANSACTIONS_PAGE_SIZE}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`,
    );

    rows.push(...page.items);
    cursor = page.nextCursor;
  } while (cursor);

  return rows;
}

export default fetchTransactionPages;
