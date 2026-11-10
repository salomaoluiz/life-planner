import { todayCalendarDate } from "@data/models/financial/calendarDate";
import { TransactionDatasource } from "@data/repositories/repos/financial/transactions/transactionDatasource";
import { SUPPORTED_CURRENCIES } from "@domain/entities/financial/Currency";
import { lastTwoYearsRange } from "@domain/entities/financial/TransactionQueryFilter";
import { api } from "@infrastructure/api";

import appendFilterParams from "../../filterQuery";
import handleFinancialApiError from "../../financialApiError";

export type Params = Parameters<
  TransactionDatasource["hasCategoryTransactions"]
>[0];
export type Response = ReturnType<
  TransactionDatasource["hasCategoryTransactions"]
>;

interface Page {
  items: unknown[];
}

// Spec 077: does the category have any transaction (account rows or card purchases) in the last two years? One row
// of each source is enough. An older one is still refused by the API when the type changes (409).
async function hasCategoryTransactions(
  ownerIds: Params,
  categoryId: string,
): Response {
  if (ownerIds.length === 0) {
    return false;
  }

  const today = todayCalendarDate();
  const query = new URLSearchParams();

  ownerIds.forEach((id) => query.append("ownerId", id));
  query.append("today", today);
  appendFilterParams(
    query,
    { categoryIds: [categoryId], ...lastTwoYearsRange(today) },
    ["categoryIds", "from"],
  );

  const path = `/v1/finance/transactions?${query.toString()}`;

  try {
    // Spec 103: the API lists one currency at a time (BRL by default), and any currency counts here. Cards bill in
    // BRL only, so their purchases are read once.
    const [cardRows, ...accountRows] = await Promise.all([
      api.get<Page>(`${path}&source=CARD&limit=1`),
      ...SUPPORTED_CURRENCIES.map(async (currency) =>
        api.get<Page>(`${path}&currency=${currency}&limit=1`),
      ),
    ]);

    return (
      cardRows.items.length +
        accountRows.reduce((sum, page) => sum + page.items.length, 0) >
      0
    );
  } catch (error) {
    return handleFinancialApiError(error, {
      categoryId,
      datasource: "TransactionDatasource - hasCategoryTransactions",
      ownerIds,
    });
  }
}

export default hasCategoryTransactions;
