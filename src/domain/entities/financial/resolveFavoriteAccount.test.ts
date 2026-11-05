import { resolveFavoriteAccount } from "./resolveFavoriteAccount";

function account(
  over: Partial<Parameters<typeof resolveFavoriteAccount>[0][number]> = {},
) {
  return {
    currency: "BRL" as const,
    id: "a1",
    isFavorite: false,
    status: "ACTIVE",
    ...over,
  };
}

const favorite = account({ id: "fav", isFavorite: true });

it("SHOULD return the favorite WHEN it is active, in the set AND in the screen currency", () => {
  expect(resolveFavoriteAccount([account(), favorite], {})).toBe(favorite);
});

it("SHOULD return undefined WHEN no account is the favorite", () => {
  expect(
    resolveFavoriteAccount([account(), account({ id: "a2" })], {}),
  ).toBeUndefined();
});

it("SHOULD return undefined WHEN the favorite is not in the account set (top filter)", () => {
  expect(resolveFavoriteAccount([account()], {})).toBeUndefined();
});

it("SHOULD return undefined WHEN the favorite is archived", () => {
  expect(
    resolveFavoriteAccount(
      [account({ id: "fav", isFavorite: true, status: "ARCHIVED" })],
      {},
    ),
  ).toBeUndefined();
});

it("SHOULD return undefined WHEN the account filter selects another account", () => {
  expect(
    resolveFavoriteAccount([favorite, account()], { accountId: "a1" }),
  ).toBeUndefined();
});

it("SHOULD return the favorite WHEN the account filter selects it", () => {
  expect(
    resolveFavoriteAccount([favorite, account()], { accountId: "fav" }),
  ).toBe(favorite);
});

it("SHOULD return undefined WHEN the screen currency differs", () => {
  expect(
    resolveFavoriteAccount([favorite], { currency: "USD" }),
  ).toBeUndefined();
});

it("SHOULD read the default currency WHEN the screen sets none", () => {
  expect(
    resolveFavoriteAccount(
      [account({ currency: "USD", id: "fav", isFavorite: true })],
      {},
    ),
  ).toBeUndefined();
});
