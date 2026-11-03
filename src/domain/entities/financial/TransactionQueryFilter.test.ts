import { monthDateRange } from "./TransactionQueryFilter";

it.each([
  ["2026-10", "2026-10-01", "2026-10-31"],
  ["2026-11", "2026-11-01", "2026-11-30"],
  ["2026-12", "2026-12-01", "2026-12-31"],
  ["2028-02", "2028-02-01", "2028-02-29"],
  ["2027-02", "2027-02-01", "2027-02-28"],
])("SHOULD give the first and last day of %s", (month, from, to) => {
  expect(monthDateRange(month)).toEqual({ from, to });
});
