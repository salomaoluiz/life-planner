import { CurrencyCode, DEFAULT_CURRENCY } from "./Currency";

interface FavoriteCandidate {
  currency?: CurrencyCode;
  id: string;
  isFavorite: boolean;
  status: string;
}

interface FavoriteScope {
  // The account filter of the screen (spec 045); empty or omitted = no filter.
  accountIds?: string[];
  // The currency the screen shows (spec 040); the default currency when omitted.
  currency?: CurrencyCode;
}

// Spec 094 FR 11: the favorite is highlighted only when it is in the screen's account set (already narrowed by the top
// filter), passes the account filter, is ACTIVE and is in the currency the screen shows. Otherwise the screen behaves as before.
function resolveFavoriteAccount<T extends FavoriteCandidate>(
  accounts: T[],
  scope: FavoriteScope,
): T | undefined {
  const favorite = accounts.find((account) => account.isFavorite);

  if (!favorite || favorite.status !== "ACTIVE") {
    return undefined;
  }
  if (scope.accountIds?.length && !scope.accountIds.includes(favorite.id)) {
    return undefined;
  }
  if (
    (favorite.currency ?? DEFAULT_CURRENCY) !==
    (scope.currency ?? DEFAULT_CURRENCY)
  ) {
    return undefined;
  }

  return favorite;
}

export type { FavoriteCandidate, FavoriteScope };
export { resolveFavoriteAccount };
