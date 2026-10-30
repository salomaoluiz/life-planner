import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";

import {
  acc,
  accountsQuery,
  archivedFamilyOwner,
  givenData,
  setup,
  spies,
  userOwner,
} from "./mocks/useAccountsViewModel.mocks";
import { fetchAccounts } from "./useAccountsViewModel";

describe("fetchAccounts", () => {
  it("SHOULD load owners then the accounts of those owners", async () => {
    const owner = { id: "user-id", name: "Alice Test", type: "USER" };
    const accounts = [acc("a", 10)];
    spies.getOwners.mockResolvedValue([owner] as never);
    spies.getAccounts.mockResolvedValue(accounts);

    const result = await fetchAccounts();

    expect(spies.getAccounts).toHaveBeenCalledWith(["user-id"]);
    expect(result).toEqual({ accounts, owners: [owner] });
  });
});

it("SHOULD total only the active accounts of the selected owner", () => {
  givenData([
    acc("a", 100, "ACTIVE", "user-id"),
    acc("b", 40, "ACTIVE", "family-1"),
    acc("c", 900, "ARCHIVED", "user-id"),
  ]);
  const { result } = setup();

  expect(result.current.ownerFilter).toBe("ALL");
  expect(result.current.totalAmount).toEqual({ value: 14000 });
  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });
  expect(result.current.totalAmount).toEqual({ value: 4000 });
  expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
    1,
  );
});

it("SHOULD count archived accounts and expand them on toggle", () => {
  givenData([acc("a", 1), acc("z", 2, "ARCHIVED")]);
  const { result } = setup();

  expect(result.current.archivedCount).toBe(1);
  expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
    1,
  );
  act(() => {
    result.current.onArchivedToggle();
  });
  expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
    2,
  );
  act(() => {
    result.current.onArchivedToggle();
  });
  expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
    1,
  );
});

it("SHOULD flag empty WHEN no accounts match the filter", () => {
  givenData([acc("a", 1, "ACTIVE", "user-id")]);
  const { result } = setup();

  expect(result.current.isEmpty).toBe(false);
  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });
  expect(result.current.isEmpty).toBe(true);
});

it("SHOULD open the form to add and to edit a row", () => {
  givenData([]);
  const { result } = setup();

  result.current.onAddPress();
  result.current.onRowPress("a1");

  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    1,
    "add_new_account",
  );
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    2,
    "add_new_account",
    { id: "a1" },
  );
});

it("SHOULD refetch WHEN the screen is focused", () => {
  givenData([]);
  spies.isFocused.mockReturnValue(true);

  setup();

  expect(accountsQuery.value.refetch).toHaveBeenCalled();
});

it("SHOULD expose the loading and error states", () => {
  accountsQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  accountsQuery.reset().withError();
  expect(setup().result.current.errorMessage).toBeDefined();
});

it("SHOULD total the end-of-month balance of the active accounts of the selected owner", () => {
  givenData([
    new AccountDTO({
      balance: 100,
      icon: "bank",
      id: "a",
      name: "a",
      owner: "USER",
      ownerId: "user-id",
      projectedBalance: 130,
      status: "ACTIVE",
    }),
    new AccountDTO({
      balance: 40,
      icon: "bank",
      id: "b",
      name: "b",
      owner: "FAMILY",
      ownerId: "family-1",
      projectedBalance: 10,
      status: "ACTIVE",
    }),
    new AccountDTO({
      balance: 900,
      icon: "bank",
      id: "c",
      name: "c",
      owner: "USER",
      ownerId: "user-id",
      projectedBalance: 5,
      status: "ARCHIVED",
    }),
  ]);
  const { result } = setup();

  expect(result.current.totalProjectedAmount).toEqual({ value: 14000 });
  act(() => {
    result.current.onOwnerFilterChange("family-1");
  });
  expect(result.current.totalProjectedAmount).toEqual({ value: 1000 });
});

describe("archived family (spec 042)", () => {
  it("SHOULD leave the archived family out of All AND show it read-only when selected", () => {
    givenData(
      [acc("a", 100, "ACTIVE", "user-id"), acc("b", 40, "ACTIVE", "family-1")],
      [archivedFamilyOwner("family-1"), userOwner],
    );
    const { result } = setup();

    expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
      1,
    );
    expect(result.current.totalAmount).toEqual({ value: 10000 });
    expect(result.current.readOnly).toBe(false);

    act(() => {
      result.current.onOwnerFilterChange("family-1");
    });

    expect(result.current.readOnly).toBe(true);
    expect(result.current.entries.filter((e) => e.kind === "row")).toHaveLength(
      1,
    );

    act(() => {
      result.current.onAddPress();
      result.current.onRowPress("b");
    });

    expect(modalNavigation.openModal).not.toHaveBeenCalled();
    expect(result.current.toastVisible).toBe(true);
  });
});
