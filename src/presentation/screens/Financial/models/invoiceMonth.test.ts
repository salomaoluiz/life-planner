import { dueDateOf, invoiceMonthOf } from "./invoiceMonth";

describe("invoiceMonthOf", () => {
  it.each([
    ["2026-10-31", 31, "2026-10"],
    ["2026-11-01", 31, "2026-11"],
    ["2026-10-10", 10, "2026-10"],
    ["2026-10-11", 10, "2026-11"],
    ["2026-02-28", 30, "2026-02"],
    ["2026-04-30", 31, "2026-04"],
    ["2026-12-31", 31, "2026-12"],
    ["2026-12-31", 15, "2027-01"],
    ["2026-12-15", 15, "2026-12"],
    ["2026-12-03", 31, "2026-12"],
  ])(
    "SHOULD put %s with closing day %i on invoice %s",
    (date, closing, month) => {
      expect(invoiceMonthOf(date, closing)).toBe(month);
    },
  );
});

describe("dueDateOf", () => {
  it.each([
    ["2026-10", 31, 10, "2026-11-10"],
    ["2026-10", 10, 20, "2026-10-20"],
    ["2026-12", 10, 5, "2027-01-05"],
    ["2026-03", 31, 31, "2026-04-30"],
  ])(
    "SHOULD put the due date of %s (closing %i, due %i) on %s",
    (month, closing, due, expected) => {
      expect(dueDateOf(month, closing, due)).toBe(expected);
    },
  );
});
