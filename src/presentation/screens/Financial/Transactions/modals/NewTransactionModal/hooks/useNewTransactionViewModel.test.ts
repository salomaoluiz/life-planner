import { act } from "@tests";

import CreditCardOverviewDTO, {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import {
  AccountHasTransactions,
  FinancialNotFound,
} from "@domain/entities/errors";

import {
  acc,
  card,
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

describe("card mode (spec 029)", () => {
  const mainCard = card("c1");

  function invoice(referenceMonth: string, status: string) {
    return new InvoiceDTO({
      amount: 1000,
      closingDate: `${referenceMonth}-31`,
      dueDate: `${referenceMonth}-10`,
      listDate: `${referenceMonth}-05`,
      paymentAfterDue: false,
      paymentDate: `${referenceMonth}-05`,
      periodEnd: `${referenceMonth}-31`,
      periodStart: `${referenceMonth}-01`,
      referenceMonth,
      status,
    });
  }

  function overviewWith(available: number, closed: InvoiceDTO[] = []) {
    return new CreditCardOverviewDTO({
      aggregate: { available, totalLimit: 100000, used: 100000 - available },
      cards: [
        new CreditCardSummaryDTO({
          available,
          card: mainCard,
          closedInvoices: closed,
          openInvoice: invoice("2026-10", "OPEN"),
          upcomingInvoices: [],
          used: 100000 - available,
        }),
      ],
    });
  }

  function inCardMode(overview = overviewWith(50000)) {
    givenLoaded({ cards: [mainCard], overview });
    const hook = setup();
    act(() => hook.result.current.onPayWithChange("CARD"));

    return hook;
  }

  it("SHOULD offer Pay with only WHEN the user has an active card", () => {
    givenLoaded();
    expect(setup().result.current.hasCards).toBe(false);

    givenLoaded({ cards: [mainCard] });
    expect(setup().result.current.hasCards).toBe(true);
  });

  it("SHOULD switch to Card: fixed expense, the card of the owner selected AND its options listed", () => {
    const { result } = inCardMode();

    expect(result.current.payWith).toBe("CARD");
    expect(result.current.type).toBe("EXPENSE");
    expect(result.current.selectedCardId).toBe("c1");
    expect(result.current.cardOptions).toEqual([
      { descriptionKey: undefined, label: "c1 ••1234", value: "c1" },
    ]);
  });

  it("SHOULD tell which invoice the purchase goes to and its due day", () => {
    const { result } = inCardMode();

    act(() => result.current.onDateChange(new Date(2026, 10, 1)));

    expect(result.current.invoiceHint).toEqual({
      due: "2026-12-10",
      month: "2026-11",
    });
  });

  it("SHOULD warn (non-blocking) WHEN the value passes the available limit by the difference", () => {
    const { result } = inCardMode(overviewWith(10000));

    act(() => result.current.onAmountChange(12000));

    expect(result.current.overLimitCents).toBe(2000);
    expect(result.current.isSaveDisabled).toBe(false);
  });

  it("SHOULD give the stored value of the purchase being edited back to the limit", () => {
    givenLoaded({
      cards: [mainCard],
      overview: overviewWith(1000),
      params: { id: "p1" },
      transactions: [
        tx("p1", { accountId: undefined, creditCardId: "c1", value: "100.00" }),
      ],
    });
    const { result } = setup();

    expect(result.current.payWith).toBe("CARD");
    act(() => result.current.onAmountChange(10500));
    expect(result.current.overLimitCents).toBe(0);
    act(() => result.current.onAmountChange(11500));
    expect(result.current.overLimitCents).toBe(500);
  });

  it("SHOULD block saving WHEN the invoice of the date is already paid", () => {
    const paid = invoice("2026-10", "PAID");
    const { result } = inCardMode(overviewWith(50000, [paid]));

    act(() => result.current.onAmountChange(1000));
    act(() => result.current.onDescriptionChange("Market"));
    act(() => result.current.onCategorySelect("food"));
    act(() => result.current.onSave());

    expect(result.current.isInvoicePaid).toBe(true);
    expect(result.current.isSaveDisabled).toBe(true);
    expect(mutations.create.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD create the purchase with creditCardId and no account", () => {
    const { result } = inCardMode();

    act(() => result.current.onAmountChange(1000));
    act(() => result.current.onDescriptionChange("Market"));
    act(() => result.current.onCategorySelect("food"));
    act(() => result.current.onSave());

    expect(mutations.create.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: undefined,
        creditCardId: "c1",
        type: "EXPENSE",
      }),
    );
  });

  describe("installments (spec 030)", () => {
    it("SHOULD be off by default, only in Card mode AND show nothing until turned on", () => {
      givenLoaded({ cards: [mainCard] });
      const { result } = setup();

      expect(result.current.installments.visible).toBe(false);
      act(() => result.current.onPayWithChange("CARD"));
      expect(result.current.installments).toEqual(
        expect.objectContaining({
          count: 2,
          enabled: false,
          preview: undefined,
          range: undefined,
          visible: true,
        }),
      );
    });

    it("SHOULD preview the split AND the first and last invoice WHEN turned on", () => {
      const { result } = inCardMode();

      act(() => result.current.onAmountChange(10000));
      act(() => result.current.onInstallmentsToggle(true));
      act(() => result.current.onInstallmentsCountChange("3"));

      expect(result.current.installments.enabled).toBe(true);
      expect(result.current.installments.countText).toBe("3");
      expect(result.current.installments.preview).toEqual({
        first: 3334,
        hasRemainder: true,
        others: 3333,
      });
      expect(result.current.installments.range).toEqual({
        first: "2026-10",
        last: "2026-12",
      });
    });

    it("SHOULD keep only digits in the count", () => {
      const { result } = inCardMode();

      act(() => result.current.onInstallmentsCountChange("1a2"));

      expect(result.current.installments.count).toBe(12);
    });

    it("SHOULD create the PLAN with the total, not a transaction, WHEN saved with installments on", () => {
      const { result } = inCardMode();

      act(() => result.current.onAmountChange(512000));
      act(() => result.current.onDescriptionChange("Notebook"));
      act(() => result.current.onCategorySelect("food"));
      act(() => result.current.onInstallmentsToggle(true));
      act(() => result.current.onInstallmentsCountChange("10"));
      act(() => result.current.onSave());

      expect(mutations.create_plan.value.mutate).toHaveBeenCalledWith(
        expect.objectContaining({
          creditCardId: "c1",
          description: "Notebook",
          installments: 10,
          value: "5120.00",
        }),
      );
      expect(mutations.create.value.mutate).not.toHaveBeenCalled();
    });

    it.each(["1", "49", ""])(
      "SHOULD NOT save with %s installments AND show the range error",
      (count) => {
        const { result } = inCardMode();

        act(() => result.current.onAmountChange(512000));
        act(() => result.current.onDescriptionChange("Notebook"));
        act(() => result.current.onCategorySelect("food"));
        act(() => result.current.onInstallmentsToggle(true));
        act(() => result.current.onInstallmentsCountChange(count));
        act(() => result.current.onSave());

        expect(mutations.create_plan.value.mutate).not.toHaveBeenCalled();
        expect(result.current.installments.error).toBe(
          "financial.transactions.form.errors.installmentsRange",
        );
      },
    );

    it("SHOULD reject a total smaller than the number of installments", () => {
      const { result } = inCardMode();

      act(() => result.current.onAmountChange(5));
      act(() => result.current.onDescriptionChange("Tiny"));
      act(() => result.current.onCategorySelect("food"));
      act(() => result.current.onInstallmentsToggle(true));
      act(() => result.current.onInstallmentsCountChange("10"));
      act(() => result.current.onSave());

      expect(mutations.create_plan.value.mutate).not.toHaveBeenCalled();
    });

    it("SHOULD reset the installments WHEN going back to Account", () => {
      const { result } = inCardMode();

      act(() => result.current.onInstallmentsToggle(true));
      act(() => result.current.onPayWithChange("ACCOUNT"));
      act(() => result.current.onPayWithChange("CARD"));

      expect(result.current.installments.enabled).toBe(false);
    });

    it("SHOULD NOT offer installments WHEN editing a purchase", () => {
      givenLoaded({
        cards: [mainCard],
        params: { id: "t1" },
        transactions: [tx("t1", { creditCardId: "c1" })],
      });

      const { result } = setup();

      expect(result.current.installments.visible).toBe(false);
    });
  });

  it("SHOULD start in Card mode WHEN opened with a creditCardId param", () => {
    givenLoaded({ cards: [mainCard], params: { creditCardId: "c1" } });

    const { result } = setup();

    expect(result.current.payWith).toBe("CARD");
    expect(result.current.selectedCardId).toBe("c1");
  });

  it("SHOULD require a card WHEN none is chosen", () => {
    givenLoaded({ cards: [mainCard] });
    const { result } = setup();
    act(() => result.current.onPayWithChange("CARD"));
    act(() => result.current.onCardChange(""));
    act(() => result.current.onSave());

    expect(result.current.cardError).toBe(
      "financial.transactions.form.errors.cardRequired",
    );
  });

  it("SHOULD change the selected card AND switch back to Account", () => {
    const { result } = inCardMode();

    act(() => result.current.onCardChange("c1"));
    act(() => result.current.onPayWithChange("ACCOUNT"));

    expect(result.current.payWith).toBe("ACCOUNT");
    expect(result.current.invoiceHint).toBeUndefined();
  });
});
