import { resultingTotal, summaryOf, validate } from "./prepaymentState";

const eligible = [4, 5, 10].map((installmentNumber) => ({
  id: `tx-${installmentNumber}`,
  installmentNumber,
  invoiceMonth: "2026-11",
  value: 51200,
}));

it("SHOULD describe the moved installments by count AND first/last number", () => {
  expect(summaryOf(eligible, 10)).toEqual({
    count: 3,
    first: "4/10",
    last: "10/10",
  });
});

it("SHOULD add what moves to the invoice AND subtract the discount (3.584 - 120 = 3.464)", () => {
  expect(resultingTotal(0, 358400, 12000)).toBe(346400);
  expect(resultingTotal(10000, 358400, 0)).toBe(368400);
  expect(resultingTotal(-500, 1000, 0)).toBe(500);
});

it("SHOULD accept no discount, one cent AND the whole moved total", () => {
  expect(validate({ discountCents: 0, hasDiscount: false }, 1000)).toEqual({});
  expect(validate({ discountCents: 1, hasDiscount: true }, 1000)).toEqual({});
  expect(validate({ discountCents: 1000, hasDiscount: true }, 1000)).toEqual(
    {},
  );
});

it("SHOULD refuse a zero discount AND one above the moved total WHEN asked for", () => {
  expect(validate({ discountCents: 0, hasDiscount: true }, 1000).discount).toBe(
    "financial.prepayment.errors.discount",
  );
  expect(
    validate({ discountCents: 1001, hasDiscount: true }, 1000).discount,
  ).toBe("financial.prepayment.errors.discount");
});
