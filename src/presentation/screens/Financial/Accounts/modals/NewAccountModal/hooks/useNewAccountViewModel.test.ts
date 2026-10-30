import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { AccountHasTransactions } from "@domain/entities/errors";

import {
  acc,
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
} from "./mocks/useNewAccountViewModel.mocks";
import { saveAccountChanges } from "./useNewAccountViewModel";

it("SHOULD be loading until owners and accounts are loaded", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD start a new account with the bank icon, zero positive balance, Personal owner and the new copy", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.icon).toBe("bank");
  expect(result.current.amountCents).toBe(0);
  expect(result.current.sign).toBe("POSITIVE");
  expect(result.current.isArchived).toBe(false);
  expect(result.current.ownerId).toBe("user-id");
  expect(result.current.isOwnerLocked).toBe(false);
  expect(result.current.titleKey).toBe("financial.accounts.new");
  expect(result.current.saveLabelKey).toBe("financial.accounts.form.save");
  expect(result.current.balanceHelperKey).toBe(
    "financial.accounts.form.initialBalanceHelper",
  );
  expect(result.current.balanceLabelKey).toBe(
    "financial.accounts.form.initialBalance",
  );
});

it("SHOULD preselect the owner from the route params", () => {
  givenLoaded({ params: { ownerId: "family-1" } });

  expect(setup().result.current.ownerId).toBe("family-1");
});

it("SHOULD prefill in edit mode, lock the owner and report notFound for an unknown id", () => {
  givenLoaded({
    accounts: [acc("a1", -12.3, { name: "Wallet", status: "ARCHIVED" })],
    params: { id: "a1" },
  });
  const { result } = setup();

  expect(result.current.name).toBe("Wallet");
  expect(result.current.amountCents).toBe(1230);
  expect(result.current.sign).toBe("NEGATIVE");
  expect(result.current.isArchived).toBe(true);
  expect(result.current.isOwnerLocked).toBe(true);
  expect(result.current.ownerHelperKey).toBe("financial.common.ownerLocked");
  expect(result.current.titleKey).toBe("financial.accounts.edit");
  expect(result.current.saveLabelKey).toBe("financial.common.saveChanges");
  expect(result.current.balanceHelperKey).toBe(
    "financial.accounts.form.balanceHelper",
  );
  expect(result.current.balanceLabelKey).toBe(
    "financial.accounts.form.balance",
  );

  givenLoaded({ accounts: [acc("a1")], params: { id: "gone" } });
  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD ignore an owner change in edit mode", () => {
  givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
  const { result } = setup();

  act(() => result.current.onOwnerChange("family-1"));

  expect(result.current.ownerId).toBe("user-id");
});

it("SHOULD NOT show the name error before the first save and show it live after", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.nameError).toBeUndefined();
  act(() => result.current.onSave());
  expect(result.current.nameError).toBe("financial.accounts.nameRequired");
  act(() => result.current.onNameChange("Checking"));
  expect(result.current.nameError).toBeUndefined();
});

it("SHOULD create an ACTIVE account with a decimal balance", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onNameChange(" Checking "));
  act(() => result.current.onAmountChange(152075));
  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    balance: 1520.75,
    icon: "bank",
    name: "Checking",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  });
});

it("SHOULD turn the amount into a negative balance WHEN the sign is negative", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onNameChange("Card"));
  act(() => result.current.onAmountChange(1500));
  act(() => result.current.onSignChange("NEGATIVE"));
  act(() => result.current.onSave());

  expect(mutations.create.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ balance: -15 }),
  );
});

it("SHOULD reject a balance above the limit with a field message", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onNameChange("Big"));
  act(() => result.current.onAmountChange(2147483648));
  act(() => result.current.onSave());

  expect(result.current.amountError).toBe(
    "financial.accounts.form.errors.balanceTooLarge",
  );
  expect(mutations.create.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD send only the changed fields on update and never the owner", () => {
  givenLoaded({
    accounts: [acc("a1", 10, { name: "Old" })],
    params: { id: "a1" },
  });
  const { result } = setup();

  act(() => result.current.onNameChange("New"));
  act(() => result.current.onArchivedChange(true));
  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "a1",
    name: "New",
    status: "ARCHIVED",
  });
});

it("SHOULD go back without a request WHEN nothing changed in edit", () => {
  givenLoaded({ accounts: [acc("a1", 10)], params: { id: "a1" } });
  const { result } = setup();

  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
});

it.each(["create", "update", "delete"] as const)(
  "SHOULD invalidate the accounts cache and go back WHEN %s succeeds",
  (name) => {
    givenLoaded();
    mutations[name].withStatus("success");

    setup();

    expect(spies.invalidate).toHaveBeenCalledTimes(1);
    expect(spies.invalidate).toHaveBeenCalledWith(["accounts"]);
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  },
);

it("SHOULD NOT invalidate WHEN a mutation fails", () => {
  givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
  mutations.update.withError(new AccountHasTransactions());

  setup();

  expect(spies.invalidate).not.toHaveBeenCalled();
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();
});

it("SHOULD NOT invalidate WHEN saving an edit with no changes", () => {
  givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
  const { result } = setup();

  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  expect(spies.invalidate).not.toHaveBeenCalled();
});

it("SHOULD keep the user's edits WHEN fresh data arrives", () => {
  givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
  const { rerender, result } = setup();

  act(() => result.current.onNameChange("My edit"));
  queries.accounts.withData([
    acc("a1", 0, { name: "Server name", status: "ARCHIVED" }),
  ]);
  rerender({});

  expect(result.current.name).toBe("My edit");
});

it("SHOULD show the fresh archived status WHEN the user has not edited", () => {
  givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
  const { rerender, result } = setup();

  expect(result.current.isArchived).toBe(false);
  queries.accounts.withData([acc("a1", 0, { status: "ARCHIVED" })]);
  rerender({});

  expect(result.current.isArchived).toBe(true);
});

it("SHOULD keep the values and expose the 006 copy WHEN deleting an account with transactions fails", () => {
  givenLoaded({
    accounts: [acc("a1", 10, { name: "Keep" })],
    params: { id: "a1" },
  });
  mutations.delete.withError(new AccountHasTransactions());

  const { result } = setup();

  expect(result.current.formErrorKey).toBe(
    "financial.accounts.errors.hasTransactions",
  );
  expect(result.current.name).toBe("Keep");
});

it("SHOULD ask to discard WHEN dirty and close directly otherwise", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => result.current.onNameChange("x"));
  act(() => result.current.onClose());
  expect(result.current.isDiscardDialogOpen).toBe(true);
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => result.current.onDiscardCancel());
  expect(result.current.isDiscardDialogOpen).toBe(false);

  act(() => result.current.onClose());
  act(() => result.current.onDiscardConfirm());
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
});

it("SHOULD confirm delete and then delete with id and ownerId", () => {
  givenLoaded({
    accounts: [acc("a1", 10, { name: "Main" })],
    params: { id: "a1" },
  });
  const { result } = setup();

  expect(result.current.deleteTitleParams).toEqual({ name: "Main" });
  act(() => result.current.onDeletePress());
  expect(result.current.isDeleteDialogOpen).toBe(true);
  act(() => result.current.onDeleteConfirm());

  expect(result.current.isDeleteDialogOpen).toBe(false);
  expect(mutations.delete.value.mutate).toHaveBeenCalledWith({
    id: "a1",
    ownerId: "user-id",
  });
});

describe("saveAccountChanges", () => {
  beforeEach(() => {
    spies.adjust.mockResolvedValue(undefined);
    spies.update.mockResolvedValue(undefined);
  });

  it("SHOULD only adjust WHEN just the balance changed (no PATCH)", async () => {
    await saveAccountChanges({ balance: 120, id: "a1" });

    expect(spies.adjust).toHaveBeenCalledWith({ balance: 120, id: "a1" });
    expect(spies.update).not.toHaveBeenCalled();
  });

  it("SHOULD only patch WHEN the balance did not change", async () => {
    await saveAccountChanges({ id: "a1", name: "New" });

    expect(spies.update).toHaveBeenCalledWith({ id: "a1", name: "New" });
    expect(spies.adjust).not.toHaveBeenCalled();
  });

  it("SHOULD adjust BEFORE archiving (an archived account refuses adjustments)", async () => {
    await saveAccountChanges({ balance: 5, id: "a1", status: "ARCHIVED" });

    expect(spies.adjust.mock.invocationCallOrder[0]).toBeLessThan(
      spies.update.mock.invocationCallOrder[0],
    );
    expect(spies.update).toHaveBeenCalledWith({
      id: "a1",
      status: "ARCHIVED",
    });
  });

  it("SHOULD reactivate BEFORE adjusting", async () => {
    await saveAccountChanges({ balance: 5, id: "a1", status: "ACTIVE" });

    expect(spies.update.mock.invocationCallOrder[0]).toBeLessThan(
      spies.adjust.mock.invocationCallOrder[0],
    );
  });

  it("SHOULD NOT adjust WHEN the patch fails first (reactivation)", async () => {
    spies.update.mockRejectedValueOnce(new Error("boom"));

    await expect(
      saveAccountChanges({ balance: 5, id: "a1", status: "ACTIVE" }),
    ).rejects.toThrow("boom");
    expect(spies.adjust).not.toHaveBeenCalled();
  });
});

it("SHOULD block saving a balance change on an archived account that stays archived", () => {
  givenLoaded({
    accounts: [acc("a1", 10, { status: "ARCHIVED" })],
    params: { id: "a1" },
  });
  const { result } = setup();

  act(() => result.current.onAmountChange(5000));
  act(() => result.current.onSave());

  expect(result.current.amountError).toBe("financial.errors.accountArchived");
  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD hand the balance change to the update mutation WHEN editing an active account", () => {
  givenLoaded({ accounts: [acc("a1", 10)], params: { id: "a1" } });
  const { result } = setup();

  act(() => result.current.onAmountChange(5000));
  act(() => result.current.onSave());

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    balance: 50,
    id: "a1",
  });
});

describe("archiving ends the recurring series (spec 034 FR 34)", () => {
  it("SHOULD ask for the active series of the account", () => {
    givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
    setup();

    expect(spies.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: ["recurrences", "account", "a1"],
        enabled: true,
      }),
    );
  });

  it("SHOULD not ask for a new or an already archived account", () => {
    givenLoaded({
      accounts: [acc("a1", 0, { status: "ARCHIVED" })],
      params: { id: "a1" },
    });
    setup();

    expect(spies.useQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        cacheKey: ["recurrences", "account", "a1"],
        enabled: false,
      }),
    );
  });

  it("SHOULD warn with the count WHEN the archived switch is turned on", () => {
    givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
    queries.recurrences.withData([{}, {}]);
    const { result } = setup();

    expect(result.current.archiveWarningCount).toBe(0);

    act(() => result.current.onArchivedChange(true));

    expect(result.current.archiveWarningCount).toBe(2);
  });

  it("SHOULD stay silent WHEN there are no series or the switch is off", () => {
    givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
    const { result } = setup();

    act(() => result.current.onArchivedChange(true));

    expect(result.current.archiveWarningCount).toBe(0);
  });

  it("SHOULD load the series of the owner through the use case", async () => {
    givenLoaded({ accounts: [acc("a1")], params: { id: "a1" } });
    setup();

    const options = spies.useQuery.mock.calls.find(
      ([option]) =>
        (option as { cacheKey: string[] }).cacheKey[0] === "recurrences",
    )![0] as { fetch: () => Promise<unknown> };

    await options.fetch();

    expect(spies.getRecurrences).toHaveBeenCalledWith({
      accountId: "a1",
      ownerIds: ["user-id"],
      status: "ACTIVE",
    });
  });
});
