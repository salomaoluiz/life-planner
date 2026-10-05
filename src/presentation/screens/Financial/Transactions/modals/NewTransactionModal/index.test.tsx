import { suppressConsoleError } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function pickers() {
  const [type, owner, account, category] = screen.UNSAFE_getAllByType(
    mocks.Picker,
  );
  return { account, category, owner, type };
}

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

describe("loading", () => {
  it.each(["owners", "categories", "accounts"] as const)(
    "SHOULD render only the loading state WHEN %s are fetching",
    (fetching) => {
      setup({ fetching });

      expect(hasText("Loading")).toBe(true);
      expect(hasText("Add new Transaction")).toBe(false);
    },
  );

  it.each(["owners", "categories", "accounts"] as const)(
    "SHOULD render only the loading state WHEN %s have not loaded",
    (missing) => {
      setup({ [missing]: undefined });

      expect(hasText("Loading")).toBe(true);
    },
  );
});

describe("form", () => {
  it("SHOULD render the title and actions WHEN everything is loaded", () => {
    setup();

    expect(hasText("Add new Transaction")).toBe(true);
    expect(
      screen.UNSAFE_getAllByProps({ label: "Add" }).length,
    ).toBeGreaterThan(0);
    expect(
      screen.UNSAFE_getAllByProps({ label: "Cancel" }).length,
    ).toBeGreaterThan(0);
  });

  it("SHOULD show an error message for each field with an error", () => {
    setup({
      errors: {
        accountId: "Account ID is required",
        categoryId: "Category ID is required",
        description: "Description is required",
        owner: "Owner is required",
        transactionDate: "Transaction Date is required",
        type: "Type is required",
        value: "Value is required",
      },
    });

    expect(hasText("Account ID is required")).toBe(true);
    expect(hasText("Category ID is required")).toBe(true);
    expect(hasText("Description is required")).toBe(true);
    expect(hasText("Owner is required")).toBe(true);
    expect(hasText("Transaction Date is required")).toBe(true);
    expect(hasText("Type is required")).toBe(true);
    expect(hasText("Value is required")).toBe(true);
  });

  it("SHOULD NOT show error messages WHEN there are no errors", () => {
    setup();

    expect(screen.UNSAFE_queryAllByProps({ visible: true })).toHaveLength(0);
  });

  it("SHOULD forward text input changes", () => {
    const { fields } = setup();

    fireEvent.changeText(
      screen.UNSAFE_getAllByProps({ label: "Description" })[0],
      "Groceries",
    );
    fireEvent.changeText(
      screen.UNSAFE_getAllByProps({ label: "Value" })[0],
      "50",
    );

    expect(fields.description.onChange).toHaveBeenCalledWith("Groceries");
    expect(fields.value.onChange).toHaveBeenCalledWith("50");
  });

  it("SHOULD show an empty value WHEN the value is undefined", () => {
    setup();

    expect(screen.UNSAFE_getAllByProps({ label: "Value" })[0].props.value).toBe(
      "",
    );
  });

  it("SHOULD forward the transaction type selection", () => {
    const { fields } = setup();

    pickers().type.props.onValueChange(TransactionType.INCOME);

    expect(fields.type.onChange).toHaveBeenCalledWith(TransactionType.INCOME);
  });

  it.each([
    ["owner-1", OwnerType.USER],
    ["owner-2", OwnerType.FAMILY],
  ])("SHOULD set ownerId and owner type WHEN %s is selected", (id, type) => {
    const { fields } = setup();

    pickers().owner.props.onValueChange(id);

    expect(fields.ownerId.onChange).toHaveBeenCalledWith(id);
    expect(fields.owner.onChange).toHaveBeenCalledWith(type);
  });

  it("SHOULD forward the date selection", () => {
    const { fields } = setup();
    const date = new Date("2025-02-01T00:00:00Z");

    screen.UNSAFE_getAllByType(mocks.DatePicker)[0].props.onConfirm({ date });

    expect(fields.transactionDate.onChange).toHaveBeenCalledWith(date);
  });

  it("SHOULD list only the accounts and categories of the active owner", () => {
    setup({ fieldValues: { ownerId: "owner-2" } });
    const { account, category } = pickers();

    expect(account.props.items).toEqual([{ label: "Joint", value: "acc-2" }]);
    expect(category.props.items).toEqual([{ label: "Rent", value: "cat-2" }]);
  });

  it("SHOULD default the active owner to the first owner", () => {
    setup();
    const { account, category } = pickers();

    expect(account.props.items).toEqual([
      { label: "Checking", value: "acc-1" },
    ]);
    expect(category.props.items).toEqual([{ label: "Food", value: "cat-1" }]);
  });

  it("SHOULD forward the account selection", () => {
    const { fields } = setup();

    pickers().account.props.onValueChange("acc-1");

    expect(fields.accountId.onChange).toHaveBeenCalledWith("acc-1");
  });

  it("SHOULD forward the category id and name WHEN a category is selected", () => {
    const { fields } = setup();

    pickers().category.props.onValueChange("cat-1");

    expect(fields.categoryId.onChange).toHaveBeenCalledWith("cat-1");
    expect(fields.category.onChange).toHaveBeenCalledWith("Food");
  });

  it("SHOULD forward an undefined category name WHEN the id is unknown", () => {
    const { fields } = setup();

    pickers().category.props.onValueChange("missing");

    expect(fields.category.onChange).toHaveBeenCalledWith(undefined);
  });
});

describe("defaults for the active owner", () => {
  it("SHOULD select the first category and account WHEN none are selected", () => {
    const { fields } = setup();

    expect(fields.categoryId.onChange).toHaveBeenCalledWith("cat-1");
    expect(fields.category.onChange).toHaveBeenCalledWith("Food");
    expect(fields.accountId.onChange).toHaveBeenCalledWith("acc-1");
  });

  it("SHOULD keep the current selection WHEN it belongs to the owner", () => {
    const { fields } = setup({
      fieldValues: { accountId: "acc-1", categoryId: "cat-1" },
    });

    expect(fields.categoryId.onChange).not.toHaveBeenCalled();
    expect(fields.category.onChange).not.toHaveBeenCalled();
    expect(fields.accountId.onChange).not.toHaveBeenCalled();
  });

  it("SHOULD replace the selection WHEN it belongs to another owner", () => {
    const { fields } = setup({
      fieldValues: {
        accountId: "acc-1",
        categoryId: "cat-1",
        ownerId: "owner-2",
      },
    });

    expect(fields.categoryId.onChange).toHaveBeenCalledWith("cat-2");
    expect(fields.category.onChange).toHaveBeenCalledWith("Rent");
    expect(fields.accountId.onChange).toHaveBeenCalledWith("acc-2");
  });

  it("SHOULD NOT select anything WHEN the owner has no categories or accounts", () => {
    const { fields } = setup({
      accounts: [],
      categories: [],
    });

    expect(fields.categoryId.onChange).not.toHaveBeenCalled();
    expect(fields.accountId.onChange).not.toHaveBeenCalled();
  });
});

describe("actions", () => {
  it("SHOULD go back WHEN Cancel is pressed and there is history", () => {
    setup();
    spies.canGoBack.mockReturnValue(true);

    press("Cancel");

    expect(spies.back).toHaveBeenCalledTimes(1);
    expect(spies.replace).not.toHaveBeenCalled();
  });

  it("SHOULD replace with the financial route WHEN Cancel is pressed without history", () => {
    setup();
    spies.canGoBack.mockReturnValue(false);

    press("Cancel");

    expect(spies.replace).toHaveBeenCalledWith("/financial");
    expect(spies.back).not.toHaveBeenCalled();
  });

  it("SHOULD cancel WHEN the backdrop is pressed", () => {
    setup();
    spies.canGoBack.mockReturnValue(true);

    fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT create the transaction WHEN the form is invalid", () => {
    const { mutate } = setup();
    mocks.validateForm.mockReturnValueOnce(undefined);

    press("Add");

    expect(mocks.validateForm).toHaveBeenCalledWith(mocks.owners);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("SHOULD create the transaction with the validated params WHEN the form is valid", () => {
    const { mutate } = setup();
    const params = { description: "Groceries" };
    mocks.validateForm.mockReturnValueOnce(params);

    press("Add");

    expect(mutate).toHaveBeenCalledWith(params);
  });

  it("SHOULD go back WHEN the transaction was created", () => {
    setup({ status: "success" });

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT go back on mount WHEN the mutation is idle", () => {
    setup();

    expect(spies.back).not.toHaveBeenCalled();
  });
});

describe("data fetching", () => {
  function queryOptions(cacheKey: string) {
    const call = spies.useQuery.mock.calls.find(
      ([options]) => options.cacheKey[0] === cacheKey,
    );
    return call![0];
  }

  it("SHOULD fetch categories for every owner WHEN the categories query runs", async () => {
    setup();
    spies.getOwners.mockResolvedValue(mocks.owners);
    spies.getCategories.mockResolvedValue(mocks.categories);

    const result = await queryOptions("categories").fetch();

    expect(spies.getCategories).toHaveBeenCalledWith(["owner-1", "owner-2"]);
    expect(result).toBe(mocks.categories);
  });

  it("SHOULD fetch accounts for every owner WHEN the accounts query runs", async () => {
    setup();
    spies.getOwners.mockResolvedValue(mocks.owners);
    spies.getAccounts.mockResolvedValue(mocks.accounts);

    const result = await queryOptions("accounts").fetch();

    expect(spies.getAccounts).toHaveBeenCalledWith(["owner-1", "owner-2"]);
    expect(result).toBe(mocks.accounts);
  });
});

describe("owners edge cases", () => {
  it("SHOULD throw WHEN the user has no owners", () => {
    // Pins current behavior (owners.data[0] is read unguarded); the fix is a
    // production change and is flagged in the PR instead.
    const restore = suppressConsoleError();

    expect(() => setup({ owners: [] })).toThrow();

    restore();
  });
});

describe("categories filtered by the selected type", () => {
  const incomeCategory = new CategoryDTO({
    icon: "cash",
    id: "cat-income",
    name: "Salary",
    owner: "USER",
    ownerId: "owner-1",
    type: "INCOME",
  });

  it("SHOULD list and select only the categories of the selected type", () => {
    const { fields } = setup({
      categories: [...mocks.categories, incomeCategory],
      fieldValues: { type: TransactionType.INCOME },
    });

    expect(pickers().category.props.items).toEqual([
      { label: "Salary", value: "cat-income" },
    ]);
    expect(fields.categoryId.onChange).toHaveBeenCalledWith("cat-income");
    expect(fields.category.onChange).toHaveBeenCalledWith("Salary");
  });

  it("SHOULD clear a stale category WHEN the owner has none of the selected type", () => {
    const { fields } = setup({
      fieldValues: { categoryId: "cat-1", type: TransactionType.INCOME },
    });

    expect(pickers().category.props.items).toEqual([]);
    expect(fields.categoryId.onChange).toHaveBeenCalledWith(undefined);
    expect(fields.category.onChange).toHaveBeenCalledWith(undefined);
  });
});
