import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useAccountsViewModel from "../useAccountsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialAccountsUseCase: {
      execute: jest.fn(),
      uniqueName: "accounts",
    },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
];

function acc(
  id: string,
  balance: number,
  status = "ACTIVE",
  ownerId = "user-id",
) {
  return new AccountDTO({
    balance,
    icon: "bank",
    id,
    name: id,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    status,
  });
}

const accountsQuery = new UseQueryFixture<{
  accounts: AccountDTO[];
  owners: OwnerDTO[];
}>();
// endregion mocks

// region spies
const spies = {
  getAccounts: jest.mocked(useCases.getFinancialAccountsUseCase.execute),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  accountsQuery.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation((() => accountsQuery.build()) as never);
});

function givenData(accounts: AccountDTO[]) {
  accountsQuery.withData({ accounts, owners });
}

function setup() {
  return renderHook(() => useAccountsViewModel());
}

export { acc, accountsQuery, givenData, owners, setup, spies };
