import { leftToPay, validate } from "./earlyPaymentState";

const target = {
  amountDueCents: 100000,
  month: "2026-10",
  status: "OPEN" as const,
  totalCents: 100000,
};
const today = new Date(2026, 9, 16);
const ok = {
  accountId: "a1",
  amountCents: 60000,
  date: today,
  method: "ACCOUNT" as const,
};

it("SHOULD add the payment's own value back WHEN editing the same invoice", () => {
  expect(leftToPay(target, 0, false)).toBe(100000);
  expect(leftToPay(target, 60000, true)).toBe(160000);
  expect(leftToPay(target, 60000, false)).toBe(100000);
  expect(leftToPay(undefined, 0, false)).toBe(0);
});

it("SHOULD accept a value from 1 cent up to what is left to pay", () => {
  expect(validate(ok, "Early payment", 100000, today)).toEqual({});
  expect(validate({ ...ok, amountCents: 100000 }, "x", 100000, today)).toEqual(
    {},
  );
  expect(validate({ ...ok, amountCents: 1 }, "x", 100000, today)).toEqual({});
});

it("SHOULD refuse zero AND a value above what is left to pay", () => {
  expect(validate({ ...ok, amountCents: 0 }, "x", 100000, today).amount).toBe(
    "financial.earlyPayment.errors.amount",
  );
  expect(
    validate({ ...ok, amountCents: 100001 }, "x", 100000, today).amount,
  ).toBe("financial.errors.overAmountDue");
});

it("SHOULD require an account only WHEN paying from an account", () => {
  expect(
    validate({ ...ok, accountId: undefined }, "x", 100000, today).account,
  ).toBe("financial.earlyPayment.errors.account");
  expect(
    validate(
      { ...ok, accountId: undefined, method: "EXTERNAL" },
      "x",
      100000,
      today,
    ),
  ).toEqual({});
});

it("SHOULD refuse an empty description AND a date after today", () => {
  expect(validate(ok, "  ", 100000, today).description).toBe(
    "financial.earlyPayment.errors.description",
  );
  expect(
    validate({ ...ok, date: new Date(2026, 9, 17) }, "x", 100000, today).date,
  ).toBe("financial.earlyPayment.errors.date");
});
