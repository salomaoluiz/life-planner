import CategoryDTO from "@application/dto/financial/CategoryDTO";

import TransactionUIModel from "./TransactionUIModel";

// What the Transactions screen caches for one month (spec 075): the rows and the categories that color them
// (spec 061: lets a row that is still being saved show its category color and icon).
interface TransactionsData {
  categories?: CategoryDTO[];
  items: TransactionUIModel[];
}

export type { TransactionsData };
