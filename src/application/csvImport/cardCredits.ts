import { normalizeText } from "./suggestColumns";
import { RowType } from "./types";

interface CardCreditCategory {
  // The fixed id the API seeds for the system category (it is not in the category lists).
  id: string;
  key: CreditCategoryKey;
  // The names it goes by in a file: the app's own and the ones of the 047 export, in both languages.
  names: string[];
  type: RowType;
}

type CreditCategoryKey =
  | "CARD_EARLY_PAYMENT"
  | "CARD_REFUND"
  | "INSTALLMENT_PREPAYMENT_DISCOUNT"
  | "INVOICE_PAYMENT";

// Spec 048 FR 10-11: the system categories a card row of the import can use.
const CARD_CREDIT_CATEGORIES: CardCreditCategory[] = [
  {
    id: "00000000-0000-4000-8000-000000000004",
    key: "CARD_REFUND",
    names: ["Estorno", "Refund", "Estorno no cartão", "Card refund"],
    type: "INCOME",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    key: "INSTALLMENT_PREPAYMENT_DISCOUNT",
    names: [
      "Desconto de adiantamento",
      "Prepayment discount",
      "Desconto de antecipação",
    ],
    type: "INCOME",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    key: "CARD_EARLY_PAYMENT",
    names: ["Pagamento adiantado", "Early payment", "Pagamento antecipado"],
    type: "INCOME",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    key: "INVOICE_PAYMENT",
    names: ["Pagamento de fatura", "Invoice payment"],
    type: "EXPENSE",
  },
];

function creditKeyOf(categoryId: string): CreditCategoryKey | undefined {
  return CARD_CREDIT_CATEGORIES.find((item) => item.id === categoryId)?.key;
}

// The payments are the two kinds that may name the account they are paid from (FR 3).
function isPaymentCategory(categoryId: string): boolean {
  const key = creditKeyOf(categoryId);

  return key === "CARD_EARLY_PAYMENT" || key === "INVOICE_PAYMENT";
}

// FR 11: the id of the system category a file value names, for the rows of that type.
function matchCreditCategory(value: string, type: RowType): string | undefined {
  const wanted = normalizeText(value);

  return CARD_CREDIT_CATEGORIES.find(
    (item) =>
      item.type === type &&
      item.names.some((name) => normalizeText(name) === wanted),
  )?.id;
}

export type { CardCreditCategory, CreditCategoryKey };
export {
  CARD_CREDIT_CATEGORIES,
  creditKeyOf,
  isPaymentCategory,
  matchCreditCategory,
};
