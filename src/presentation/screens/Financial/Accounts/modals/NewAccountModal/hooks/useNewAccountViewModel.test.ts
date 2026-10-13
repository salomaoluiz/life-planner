import { act } from "@tests";

import { AccountHasTransactions } from "@domain/entities/errors";

import {
  acc,
  givenLoaded,
  mutations,
  setup,
  spies,
} from "./mocks/useNewAccountViewModel.mocks";

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
    "financial.accounts.form.balanceHelper",
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
  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN a mutation succeeds", () => {
  givenLoaded();
  mutations.create.withStatus("success");

  setup();

  expect(spies.back).toHaveBeenCalled();
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
  expect(spies.back).toHaveBeenCalledTimes(1);

  act(() => result.current.onNameChange("x"));
  act(() => result.current.onClose());
  expect(result.current.isDiscardDialogOpen).toBe(true);
  expect(spies.back).toHaveBeenCalledTimes(1);

  act(() => result.current.onDiscardCancel());
  expect(result.current.isDiscardDialogOpen).toBe(false);

  act(() => result.current.onClose());
  act(() => result.current.onDiscardConfirm());
  expect(spies.back).toHaveBeenCalledTimes(2);
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
