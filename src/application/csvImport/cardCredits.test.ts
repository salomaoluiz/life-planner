import {
  CARD_CREDIT_CATEGORIES,
  creditKeyOf,
  matchCreditCategory,
} from "./cardCredits";

describe("matchCreditCategory", () => {
  it.each([
    ["Estorno", "CARD_REFUND", "INCOME"],
    ["Refund", "CARD_REFUND", "INCOME"],
    ["Estorno no cartão", "CARD_REFUND", "INCOME"],
    ["Card refund", "CARD_REFUND", "INCOME"],
    ["Desconto de adiantamento", "INSTALLMENT_PREPAYMENT_DISCOUNT", "INCOME"],
    ["Desconto de antecipação", "INSTALLMENT_PREPAYMENT_DISCOUNT", "INCOME"],
    ["Prepayment discount", "INSTALLMENT_PREPAYMENT_DISCOUNT", "INCOME"],
    ["Pagamento adiantado", "CARD_EARLY_PAYMENT", "INCOME"],
    ["Pagamento antecipado", "CARD_EARLY_PAYMENT", "INCOME"],
    ["early payment", "CARD_EARLY_PAYMENT", "INCOME"],
    ["Pagamento de fatura", "INVOICE_PAYMENT", "EXPENSE"],
    ["Invoice payment", "INVOICE_PAYMENT", "EXPENSE"],
  ])("SHOULD match %s to %s for %s rows", (value, key, type) => {
    const id = matchCreditCategory(value, type as "EXPENSE" | "INCOME");

    expect(creditKeyOf(id as string)).toBe(key);
  });

  it("SHOULD not match a credit category to rows of the other type", () => {
    expect(matchCreditCategory("Estorno", "EXPENSE")).toBeUndefined();
    expect(
      matchCreditCategory("Pagamento de fatura", "INCOME"),
    ).toBeUndefined();
  });

  it("SHOULD not match a regular name", () => {
    expect(matchCreditCategory("Mercado", "EXPENSE")).toBeUndefined();
    expect(CARD_CREDIT_CATEGORIES).toHaveLength(4);
  });
});
