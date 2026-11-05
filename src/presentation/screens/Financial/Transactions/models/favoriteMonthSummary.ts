import CardInvoiceUIModel from "./CardInvoiceUIModel";
import { ProjectedData } from "./transactionsData";
import TransactionUIModel from "./TransactionUIModel";

interface FavoriteMonthInput {
  favoriteId: string;
  invoices: CardInvoiceUIModel[];
  items: TransactionUIModel[];
  // Card id → the account that pays its invoice (spec 035); decides who pays an invoice that is still open.
  paymentAccountByCardId: ReadonlyMap<string, string>;
  projections: ProjectedData;
}

// One column of the month summary table: the favorite (primary) or the total of the filter (muted).
interface MonthSummaryColumnData {
  emphasis: "muted" | "primary";
  key: "favorite" | "total";
  values: MonthSummaryValues;
}

// Integer cents; the same figures the month summary card shows (spec 094.2).
interface MonthSummaryValues {
  balanceCents: number;
  expenseCents: number;
  incomeCents: number;
  projectedExpenseCents: number;
  projectedIncomeCents: number;
  toPayCents: number;
  toReceiveCents: number;
}

// Spec 094.2 FR 8 (the 094 Home rule): the favorite's own account rows plus the invoices it pays or paid, each invoice
// once for its amount due. Card purchases never count one by one.
function favoriteMonthSummary(input: FavoriteMonthInput): MonthSummaryValues {
  const values: MonthSummaryValues = {
    balanceCents: 0,
    expenseCents: 0,
    incomeCents: 0,
    projectedExpenseCents: 0,
    projectedIncomeCents: 0,
    toPayCents: 0,
    toReceiveCents: 0,
  };

  input.items
    .filter(
      (item) =>
        item.accountId === input.favoriteId &&
        !item.isCardPurchase &&
        !item.isAdjustment,
    )
    .forEach((item) => {
      if (item.isExpense) {
        values.expenseCents += item.amountCents;
        values.toPayCents += item.isPaid ? 0 : item.amountCents;
      } else {
        values.incomeCents += item.amountCents;
        values.toReceiveCents += item.isPaid ? 0 : item.amountCents;
      }
    });

  input.invoices
    .filter((invoice) => payerOf(invoice, input) === input.favoriteId)
    .forEach((invoice) => {
      values.expenseCents += invoice.amountCents;
      values.toPayCents += invoice.hasPayment ? 0 : invoice.amountCents;
    });

  input.projections.accountItems
    .filter((item) => item.accountId === input.favoriteId)
    .forEach((item) => {
      if (item.isExpense) {
        values.projectedExpenseCents += item.amountCents;
      } else {
        values.projectedIncomeCents += item.amountCents;
      }
    });

  values.balanceCents = values.incomeCents - values.expenseCents;

  return values;
}

function payerOf(invoice: CardInvoiceUIModel, input: FavoriteMonthInput) {
  return invoice.hasPayment
    ? invoice.paidAccountId
    : input.paymentAccountByCardId.get(invoice.cardId);
}

export type { FavoriteMonthInput, MonthSummaryColumnData, MonthSummaryValues };
export { favoriteMonthSummary };
