import { act } from "@tests";

import {
  AccountHasTransactions,
  FinancialNotFound,
} from "@domain/entities/errors";

import {
  acc,
  cat,
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
  tx,
} from "./mocks/useNewTransactionViewModel.mocks";

it("SHOULD be loading until owners, accounts and categories are loaded", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD start as an expense for today with the default account and the Personal owner", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.type).toBe("EXPENSE");
  expect(result.current.ownerId).toBe("user-id");
  expect(result.current.selectedAccountId).toBe("a1");
  expect(result.current.date).toEqual(new Date(2026, 9, 5));
  expect(result.current.titleKey).toBe("financial.transactions.form.newTitle");
  expect(result.current.saveLabelKey).toBe(
    "financial.transactions.form.saveExpense",
  );
});

it("SHOULD expose the most used categories as chips with their color dot", () => {
  givenLoaded({ top: [cat("food", "user-id", "EXPENSE", "#F59E0B")] });
  const { result } = setup();

  expect(result.current.categoryChips).toEqual([
    { colorDot: "#F59E0B", label: "food", value: "food" },
  ]);
});

it("SHOULD key the most-used query by owner and type", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onTypeChange("INCOME" as never);
  });

  const keys = spies.useQuery.mock.calls
    .map((call) => call[0].cacheKey)
    .filter((key) => key[0] === "most_used");
  expect(keys[0]).toEqual(["most_used", "user-id", "EXPENSE"]);
  expect(keys[keys.length - 1]).toEqual(["most_used", "user-id", "INCOME"]);
});

it("SHOULD clear a category of the other type, and switch the label and tone WHEN the type changes", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onCategorySelect("food");
  });
  act(() => {
    result.current.onTypeChange("INCOME" as never);
  });

  expect(result.current.selectedCategoryId).toBeUndefined();
  expect(result.current.saveLabelKey).toBe(
    "financial.transactions.form.saveIncome",
  );
  expect(result.current.typeTone).toBe("income");
});

it("SHOULD clear category and swap the account WHEN the owner changes", () => {
  givenLoaded({ accounts: [acc("a1"), acc("a2", "family-1")] });
  const { result } = setup();

  act(() => {
    result.current.onCategorySelect("food");
  });
  act(() => {
    result.current.onOwnerChange("family-1");
  });

  expect(result.current.selectedCategoryId).toBeUndefined();
  expect(result.current.selectedAccountId).toBe("a2");
});

it("SHOULD NOT show errors before the first save, then show them live", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.amountError).toBeUndefined();

  act(() => {
    result.current.onSave();
  });
  expect(result.current.amountError).toBe(
    "financial.transactions.form.errors.amountRequired",
  );
  expect(result.current.descriptionError).toBe(
    "financial.transactions.form.errors.descriptionRequired",
  );

  act(() => {
    result.current.onAmountChange(100);
  });
  expect(result.current.amountError).toBeUndefined();
});

it("SHOULD NOT call create WHEN the form is invalid", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD call create with a decimal-string value and the category name WHEN valid", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onAmountChange(31290);
  });
  act(() => {
    result.current.onDescriptionChange("Weekly shop");
  });
  act(() => {
    result.current.onCategorySelect("food");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    accountId: "a1",
    category: "food",
    categoryId: "food",
    date: new Date(2026, 9, 5).toISOString(),
    description: "Weekly shop",
    owner: "USER",
    ownerId: "user-id",
    type: "EXPENSE",
    value: "312.90",
  });
});

it("SHOULD prefill in edit mode and call update with the id", () => {
  givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
  const { result } = setup();

  expect(result.current.isEditing).toBe(true);
  expect(result.current.amountCents).toBe(31290);
  expect(result.current.description).toBe("Shop");
  expect(result.current.titleKey).toBe("financial.transactions.form.editTitle");
  expect(result.current.saveLabelKey).toBe("financial.common.saveChanges");

  act(() => {
    result.current.onDescriptionChange("Changed");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      description: "Changed",
      id: "tx-1",
      value: "312.90",
    }),
  );
});

it("SHOULD report notFound WHEN the edit id is not in the loaded transactions", () => {
  givenLoaded({ params: { id: "gone" }, transactions: [tx("tx-1")] });

  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD go back WHEN a mutation succeeds", () => {
  givenLoaded();
  mutations.create.withStatus("success");

  setup();

  expect(spies.back).toHaveBeenCalled();
});

it("SHOULD keep the values and expose the 006 key WHEN the mutation fails", () => {
  givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
  mutations.update.withError(new FinancialNotFound());
  const { result } = setup();

  expect(result.current.formErrorKey).toBe("financial.errors.notFound");
  expect(result.current.amountCents).toBe(31290);
});

it("SHOULD close directly WHEN not dirty and ask to discard WHEN dirty", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onClose();
  });
  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(result.current.isDiscardDialogOpen).toBe(false);

  act(() => {
    result.current.onDescriptionChange("typed");
  });
  act(() => {
    result.current.onClose();
  });
  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(result.current.isDiscardDialogOpen).toBe(true);

  act(() => {
    result.current.onDiscardCancel();
  });
  expect(result.current.isDiscardDialogOpen).toBe(false);

  act(() => {
    result.current.onClose();
  });
  act(() => {
    result.current.onDiscardConfirm();
  });
  expect(spies.back).toHaveBeenCalledTimes(2);
});

it("SHOULD ask before deleting and delete with id and ownerId after confirming", () => {
  givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
  const { result } = setup();

  act(() => {
    result.current.onDeletePress();
  });
  expect(result.current.isDeleteDialogOpen).toBe(true);
  expect(mutations.delete.value.mutate).not.toHaveBeenCalled();

  act(() => {
    result.current.onDeleteConfirm();
  });
  expect(mutations.delete.value.mutate).toHaveBeenCalledWith({
    id: "tx-1",
    ownerId: "user-id",
  });
});

it("SHOULD close the delete dialog WHEN canceled", () => {
  givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
  const { result } = setup();

  act(() => {
    result.current.onDeletePress();
  });
  act(() => {
    result.current.onDeleteCancel();
  });

  expect(result.current.isDeleteDialogOpen).toBe(false);
});

it("SHOULD show the has-transactions style 006 copy WHEN delete fails", () => {
  givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
  mutations.delete.withError(new AccountHasTransactions());

  expect(setup().result.current.formErrorKey).toBe(
    "financial.accounts.errors.hasTransactions",
  );
});

it("SHOULD flag an owner without accounts or categories and open the create forms with params", () => {
  givenLoaded({ accounts: [], categories: [] });
  const { result } = setup();

  expect(result.current.hasNoAccounts).toBe(true);
  expect(result.current.hasNoCategories).toBe(true);

  act(() => {
    result.current.onCreateAccountPress();
  });
  act(() => {
    result.current.onCreateCategoryPress();
  });

  expect(spies.push).toHaveBeenNthCalledWith(1, {
    params: { ownerId: "user-id" },
    pathname: "/financial/account/add_new_account",
  });
  expect(spies.push).toHaveBeenNthCalledWith(2, {
    params: { ownerId: "user-id", type: "EXPENSE" },
    pathname: "/financial/category/add_new_category",
  });
});

it("SHOULD select the new account WHEN the account list gains one after the inline create", () => {
  givenLoaded({ accounts: [] });
  const { rerender, result } = setup();

  act(() => {
    result.current.onCreateAccountPress();
  });
  queries.accounts.withData([acc("new-account")]);
  rerender({});

  expect(result.current.selectedAccountId).toBe("new-account");
});

it("SHOULD refetch accounts and categories WHEN the screen regains focus", () => {
  givenLoaded();
  spies.focused.mockReturnValue(true);

  setup();

  expect(queries.accounts.value.refetch).toHaveBeenCalled();
  expect(queries.categories.value.refetch).toHaveBeenCalled();
});

it("SHOULD filter the category picker rows by the search text", () => {
  givenLoaded({ categories: [cat("food"), cat("rent")] });
  const { result } = setup();

  act(() => {
    result.current.onCategoryPickerOpen();
  });
  act(() => {
    result.current.onCategoryQueryChange("re");
  });

  expect(result.current.isCategoryPickerOpen).toBe(true);
  expect(result.current.categoryQuery).toBe("re");
  expect(
    result.current.categoryPickerRows.map((row) => row.category.id),
  ).toEqual(["rent"]);
});
