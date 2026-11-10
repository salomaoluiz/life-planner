import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountType } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";

import useEligibleAccounts from "./useEligibleAccounts";

jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
  },
}));

function account(
  id: string,
  name: string,
  overrides: Partial<ConstructorParameters<typeof AccountDTO>[0]> = {},
) {
  return new AccountDTO({
    balance: 0,
    currency: "BRL",
    icon: "bank",
    id,
    name,
    owner: "USER",
    ownerId: "user-1",
    status: "ACTIVE",
    ...overrides,
  });
}

const query = new UseQueryFixture<{
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}>();

beforeEach(() => {
  query.reset();
  jest.mocked(useOwnerScopedQuery).mockReturnValue(query.build() as never);
});

it("SHOULD be empty until the accounts arrive", () => {
  const { result } = renderHook(() => useEligibleAccounts("x"));

  expect(result.current.isLoaded).toBe(false);
  expect(result.current.accounts).toEqual([]);
});

it("SHOULD keep only active BRL accounts of a writable owner, brokerage first", () => {
  query.withData({
    accounts: [
      account("b", "Bank"),
      account("a", "Alpha", { type: AccountType.BROKERAGE }),
      account("usd", "Dollar", { currency: "USD" }),
      account("old", "Old", { status: "ARCHIVED" }),
      account("fam", "Family", { ownerId: "fam-1" }),
    ],
    owners: [
      new OwnerDTO({ id: "user-1", name: "Me", type: OwnerType.USER }),
      new OwnerDTO({
        archived: true,
        id: "fam-1",
        name: "Fam",
        type: OwnerType.FAMILY,
      }),
    ],
  });
  jest.mocked(useOwnerScopedQuery).mockReturnValue(query.build() as never);

  const { result } = renderHook(() => useEligibleAccounts("x"));

  expect(result.current.isLoaded).toBe(true);
  expect(result.current.accounts.map((item) => item.id)).toEqual(["a", "b"]);
  expect(result.current.options).toEqual([
    { label: "Alpha · BRL", value: "a" },
    { label: "Bank · BRL", value: "b" },
  ]);
});
