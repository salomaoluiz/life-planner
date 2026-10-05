export const CLOSE_TO_EXPIRATION_DAYS = 7;

const DAY_IN_MS = 24 * 60 * 60 * 1000;

export enum StockExpirationStatus {
  EXPIRED = "EXPIRED",
  EXPIRING = "EXPIRING",
  OK = "OK",
}

export function daysUntilExpiration(
  expirationDate: Date | undefined,
  now: Date,
): number | undefined {
  if (!expirationDate) {
    return undefined;
  }

  return Math.round((startOfDay(expirationDate) - startOfDay(now)) / DAY_IN_MS);
}

export function getStockExpirationStatus(
  expirationDate: Date | undefined,
  now: Date,
): StockExpirationStatus {
  const days = daysUntilExpiration(expirationDate, now);

  if (days === undefined) {
    return StockExpirationStatus.OK;
  }

  if (days < 0) {
    return StockExpirationStatus.EXPIRED;
  }

  return days <= CLOSE_TO_EXPIRATION_DAYS
    ? StockExpirationStatus.EXPIRING
    : StockExpirationStatus.OK;
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}
