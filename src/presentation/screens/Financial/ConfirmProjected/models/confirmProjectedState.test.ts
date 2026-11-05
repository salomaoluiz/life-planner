import {
  centsToDecimal,
  chargedInvoiceMonth,
  differenceCents,
  isValidCharge,
} from "./confirmProjectedState";

it("SHOULD give the difference between what was charged and what was projected", () => {
  expect(differenceCents(9990, 10000)).toBe(-10);
  expect(differenceCents(10500, 10000)).toBe(500);
  expect(differenceCents(10000, 10000)).toBe(0);
});

it("SHOULD put the charge on the invoice of its date by the closing day", () => {
  expect(chargedInvoiceMonth(new Date(2026, 9, 24), 10)).toBe("2026-11");
  expect(chargedInvoiceMonth(new Date(2026, 9, 5), 10)).toBe("2026-10");
});

it("SHOULD accept only a charge above zero", () => {
  expect(isValidCharge(1)).toBe(true);
  expect(isValidCharge(0)).toBe(false);
});

it("SHOULD write cents as the decimal text the data layer takes", () => {
  expect(centsToDecimal(9990)).toBe("99.90");
  expect(centsToDecimal(5)).toBe("0.05");
});
