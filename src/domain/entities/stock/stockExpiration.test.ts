import {
  CLOSE_TO_EXPIRATION_DAYS,
  daysUntilExpiration,
  getStockExpirationStatus,
  StockExpirationStatus,
} from "./stockExpiration";

const now = new Date(2026, 9, 5, 23, 59, 0);

function daysFromToday(days: number) {
  return new Date(2026, 9, 5 + days, 0, 0, 0);
}

it("SHOULD use a 7 day window", () => {
  expect(CLOSE_TO_EXPIRATION_DAYS).toBe(7);
});

it("SHOULD return undefined days WHEN there is no expiration date", () => {
  expect(daysUntilExpiration(undefined, now)).toBeUndefined();
});

it("SHOULD return 0 days for a date stored at 00:00 today even at 23:59", () => {
  expect(daysUntilExpiration(daysFromToday(0), now)).toBe(0);
});

it("SHOULD ignore the time of day when counting days", () => {
  expect(
    daysUntilExpiration(
      new Date(2026, 9, 6, 23, 59),
      new Date(2026, 9, 5, 0, 1),
    ),
  ).toBe(1);
});

it("SHOULD return negative days for past dates", () => {
  expect(daysUntilExpiration(daysFromToday(-3), now)).toBe(-3);
});

it.each([
  [undefined, StockExpirationStatus.OK],
  [-1, StockExpirationStatus.EXPIRED],
  [0, StockExpirationStatus.EXPIRING],
  [1, StockExpirationStatus.EXPIRING],
  [7, StockExpirationStatus.EXPIRING],
  [8, StockExpirationStatus.OK],
])("SHOULD classify %s days from today as %s", (days, expected) => {
  const date = days === undefined ? undefined : daysFromToday(days);

  expect(getStockExpirationStatus(date, now)).toBe(expected);
});
