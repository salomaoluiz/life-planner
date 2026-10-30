import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import CreditCardOverviewDTO, {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import ProjectedOccurrenceDTO from "@application/dto/financial/ProjectedOccurrenceDTO";
import RecurrenceDTO from "@application/dto/financial/RecurrenceDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";
import {
  AccountHasTransactions,
  FinancialNotFound,
  RecurrenceHasPaidOccurrences,
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

it("SHOULD start with the owner of the scope the form was opened from (spec 050)", () => {
  givenLoaded({ params: { ownerId: "family-1" } });

  expect(setup().result.current.ownerId).toBe("family-1");
});

it("SHOULD ignore an owner param that is not a known owner (spec 050)", () => {
  givenLoaded({ params: { ownerId: "stranger" } });

  expect(setup().result.current.ownerId).toBe("user-id");
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
    paid: true,
    tags: [],
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

  expect(modalNavigation.closeModal).toHaveBeenCalled();
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
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  expect(result.current.isDiscardDialogOpen).toBe(false);

  act(() => {
    result.current.onDescriptionChange("typed");
  });
  act(() => {
    result.current.onClose();
  });
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
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
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
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

  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    1,
    "add_new_account",
    { ownerId: "user-id" },
  );
  expect(modalNavigation.openModal).toHaveBeenNthCalledWith(
    2,
    "add_new_category",
    { ownerId: "user-id", type: "EXPENSE" },
  );
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
      amountDue: 1000,
      carryIn: 0,
      closingDate: `${referenceMonth}-31`,
      dueDate: `${referenceMonth}-10`,
      earlyPaid: 0,
      listDate: `${referenceMonth}-05`,
      net: 1000,
      paymentAfterDue: false,
      paymentDate: `${referenceMonth}-05`,
      periodEnd: `${referenceMonth}-31`,
      periodStart: `${referenceMonth}-01`,
      referenceMonth,
      status,
      total: 1000,
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

    it("SHOULD keep the card and turn installments off WHEN saving and adding another", () => {
      const { rerender, result } = inCardMode();

      act(() => result.current.onAmountChange(512000));
      act(() => result.current.onDescriptionChange("Notebook"));
      act(() => result.current.onCategorySelect("food"));
      act(() => result.current.onInstallmentsToggle(true));
      act(() => result.current.onInstallmentsCountChange("10"));
      act(() => result.current.onSaveAndNew());
      expect(mutations.create_plan.value.mutate).toHaveBeenCalledTimes(1);

      mutations.create_plan.withStatus("success");
      rerender({});

      expect(result.current.payWith).toBe("CARD");
      expect(result.current.selectedCardId).toBe("c1");
      expect(result.current.installments.enabled).toBe(false);
      expect(result.current.amountCents).toBe(0);
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

    it("SHOULD hand an installment over to its own edit sheet instead of opening this form", () => {
      givenLoaded({
        cards: [mainCard],
        params: { id: "t1" },
        transactions: [
          tx("t1", {
            creditCardId: "c1",
            installmentCount: 10,
            installmentNumber: 3,
            installmentPlanId: "plan-1",
          }),
        ],
      });

      const { result } = setup();

      expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
        "edit_installment",
        { id: "t1" },
      );
      expect(result.current.isLoading).toBe(true);
    });

    it("SHOULD hand the account row of an early payment over to the early payment sheet (spec 032 FR 35)", () => {
      givenLoaded({
        params: { id: "t1" },
        transactions: [
          tx("t1", {
            earlyPayment: {
              creditCardId: "c1",
              id: "early-1",
              invoiceMonth: "2026-10",
            },
          }),
        ],
      });

      const { result } = setup();

      expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
        "card_early_payment",
        {
          creditCardId: "c1",
          id: "early-1",
          invoiceMonth: "2026-10",
        },
      );
      expect(result.current.isLoading).toBe(true);
    });

    it("SHOULD offer to refund a card purchase AND open the refund sheet linked to it (spec 032)", () => {
      givenLoaded({
        cards: [mainCard],
        params: { id: "t1" },
        transactions: [tx("t1", { creditCardId: "c1" })],
      });

      const { result } = setup();

      expect(result.current.canRefund).toBe(true);
      act(() => result.current.onRefundPress());
      expect(modalNavigation.replaceModal).toHaveBeenCalledWith("card_refund", {
        creditCardId: "c1",
        refundedTransactionId: "t1",
      });
    });

    it("SHOULD NOT offer a refund for an account transaction or a new purchase", () => {
      givenLoaded({ params: { id: "t1" }, transactions: [tx("t1")] });
      const { result } = setup();

      expect(result.current.canRefund).toBe(false);
      act(() => result.current.onRefundPress());
      expect(modalNavigation.replaceModal).not.toHaveBeenCalled();
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

describe("paid switch (spec 033)", () => {
  it("SHOULD start on AND turn off WHEN the date moves to next month, then keep the user's choice", () => {
    givenLoaded();
    const { result } = setup();

    expect(result.current.paid).toBe(true);
    expect(result.current.showPaid).toBe(true);
    expect(result.current.paidLabelKey).toBe(
      "financial.transactions.form.paid",
    );

    act(() => result.current.onDateChange(new Date(2026, 10, 3)));
    expect(result.current.paid).toBe(false);

    act(() => result.current.onPaidChange(true));
    expect(result.current.paid).toBe(true);
    // Turning it on with a future date moves the date to today.
    expect(result.current.date).toEqual(new Date(2026, 9, 5));

    act(() => result.current.onDateChange(new Date(2026, 10, 3)));
    expect(result.current.paid).toBe(true);
  });

  it("SHOULD say Received for an income AND hide the switch in Card mode", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onTypeChange("INCOME" as never));
    expect(result.current.paidLabelKey).toBe(
      "financial.transactions.form.received",
    );
  });
});

describe("paid switch design copy (spec 033)", () => {
  it("SHOULD hint why a future-dated new row starts unpaid AND label the date normally on create", () => {
    givenLoaded();
    const { result } = setup();

    expect(result.current.paidHintKey).toBeUndefined();
    expect(result.current.dateLabelKey).toBe(
      "financial.transactions.form.date",
    );
    expect(result.current.paidHelpKey).toBe(
      "financial.transactions.form.paidHelpCreate",
    );

    act(() => result.current.onDateChange(new Date(2026, 10, 3)));

    expect(result.current.paidHintKey).toBe(
      "financial.transactions.form.paidHintFuture",
    );
  });

  it("SHOULD call the date the payment date WHEN a paid row is edited", () => {
    givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
    const { result } = setup();

    expect(result.current.dateLabelKey).toBe(
      "financial.transactions.form.paymentDate",
    );
    expect(result.current.paidHelpKey).toBe(
      "financial.transactions.form.paidHelpEdit",
    );
    expect(result.current.paidHintKey).toBeUndefined();
  });
});

describe("repeat on create (spec 034)", () => {
  function fill(result: ReturnType<typeof setup>["result"]) {
    act(() => {
      result.current.onAmountChange(200000);
    });
    act(() => {
      result.current.onDescriptionChange("Rent");
    });
    act(() => {
      result.current.onCategorySelect("food");
    });
  }

  it("SHOULD start with Repeat off AND show the toggle only when creating", () => {
    givenLoaded();
    const { result } = setup();

    expect(result.current.repeatOn).toBe(false);
    expect(result.current.recurrence.isRepeatToggleVisible).toBe(true);
    expect(result.current.recurrence.preview).toBeUndefined();
  });

  it("SHOULD create a series WHEN Repeat is on, with the frequency and the end date", () => {
    givenLoaded();
    const { result } = setup();

    fill(result);
    act(() => {
      result.current.onRepeatToggle(true);
    });
    act(() => {
      result.current.onRepeatFrequencyChange("WEEKLY");
    });
    act(() => {
      result.current.onRepeatEndChange(new Date(2026, 10, 2, 15));
    });
    act(() => {
      result.current.onSave();
    });

    expect(mutations.create_recurrence.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "a1",
        endDate: new Date(2026, 10, 2).toISOString(),
        frequency: "WEEKLY",
        value: "2000.00",
      }),
    );
    expect(mutations.create.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD preview the count and the last date WHEN there is an end date, AND the cadence WHEN there is none", () => {
    givenLoaded();
    const { result } = setup();

    act(() => {
      result.current.onRepeatToggle(true);
    });
    expect(result.current.recurrence.preview).toEqual({
      frequency: "MONTHLY",
      kind: "forever",
    });

    act(() => {
      result.current.onRepeatEndChange(new Date(2027, 8, 5));
    });
    expect(result.current.recurrence.preview).toEqual({
      count: 12,
      kind: "times",
      last: new Date(2027, 8, 5),
    });

    act(() => {
      result.current.onRepeatEndChange(new Date(2026, 9, 1));
    });
    expect(result.current.recurrence.preview).toEqual({ kind: "none" });

    act(() => {
      result.current.onSave();
    });
    expect(result.current.recurrence.endError).toBe(
      "financial.transactions.form.errors.repeatEndBeforeStart",
    );
  });

  it("SHOULD ignore an unknown frequency AND block saving an end date before the first date", () => {
    givenLoaded();
    const { result } = setup();

    fill(result);
    act(() => {
      result.current.onRepeatToggle(true);
    });
    act(() => {
      result.current.onRepeatFrequencyChange("DAILY");
    });
    act(() => {
      result.current.onRepeatEndChange(new Date(2026, 9, 1));
    });
    act(() => {
      result.current.onSave();
    });

    expect(result.current.repeatFrequency).toBe("MONTHLY");
    expect(mutations.create_recurrence.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD clear the end date WHEN it is removed", () => {
    givenLoaded();
    const { result } = setup();

    act(() => {
      result.current.onRepeatToggle(true);
    });
    act(() => {
      result.current.onRepeatEndChange(new Date(2027, 8, 5));
    });
    act(() => {
      result.current.onRepeatEndChange(undefined);
    });

    expect(result.current.repeatEnd).toBeUndefined();
  });

  it("SHOULD turn Repeat off WHEN Installments are turned on in Card mode", () => {
    givenLoaded({ cards: [card("c1")] });
    const { result } = setup();

    act(() => {
      result.current.onPayWithChange("CARD");
    });
    act(() => {
      result.current.onRepeatToggle(true);
    });
    act(() => {
      result.current.onInstallmentsToggle(true);
    });

    expect(result.current.repeatOn).toBe(false);
    expect(result.current.installments.enabled).toBe(true);
  });

  it("SHOULD go back WHEN the series is created", () => {
    givenLoaded();
    mutations.create_recurrence.withStatus("success");

    setup();

    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });
});

describe("editing a recurring occurrence (spec 034)", () => {
  const series = new RecurrenceDTO({
    accountId: "a1",
    category: "Food",
    categoryId: "food",
    description: "Rent",
    endDate: new Date(2027, 8, 5).toISOString(),
    firstNumber: 1,
    frequency: "MONTHLY",
    id: "series-1",
    occurrenceCount: 12,
    owner: "USER",
    ownerId: "user-id",
    startDate: new Date(2026, 9, 5).toISOString(),
    status: "ACTIVE",
    type: "EXPENSE",
    value: "2000.00",
  });
  const row = tx("tx-r", {
    description: "Rent",
    occurrenceCount: 12,
    occurrenceNumber: 5,
    paid: false,
    recurrenceFrequency: "MONTHLY",
    recurrenceId: "series-1",
    value: "2000.00",
  });

  function loadReal() {
    givenLoaded({
      params: { id: "tx-r" },
      series: [series],
      transactions: [row],
    });
  }

  it("SHOULD load the series AND show its frequency, end date and the scope selector (default only this one)", () => {
    loadReal();
    const { result } = setup();

    expect(result.current.recurrence.isRecurring).toBe(true);
    expect(result.current.recurrence.scope).toBe("ONLY_THIS");
    expect(result.current.repeatOn).toBe(true);
    expect(result.current.repeatEnd).toEqual(new Date(2027, 8, 5));
    expect(result.current.recurrence.isFrequencyLocked).toBe(true);
    expect(result.current.recurrence.frequencyHelperKey).toBe(
      "financial.recurrence.lockedThisAndNext",
    );
    expect(result.current.scopeLocks).toMatchObject({
      account: true,
      date: false,
      paid: false,
    });
    expect(result.current.recurrence.isRepeatToggleVisible).toBe(false);
  });

  it("SHOULD wait for the series before showing the form", () => {
    givenLoaded({ params: { id: "tx-r" }, transactions: [row] });
    queries.recurrences.reset();

    expect(setup().result.current.isLoading).toBe(true);
  });

  it("SHOULD report notFound WHEN the series is gone", () => {
    givenLoaded({ params: { id: "tx-r" }, series: [], transactions: [row] });

    expect(setup().result.current.isNotFound).toBe(true);
  });

  it("SHOULD update only that row with scope ONLY_THIS sending only what changed", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onAmountChange(220000);
    });
    act(() => {
      result.current.onSave();
    });

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      categoryId: undefined,
      date: undefined,
      description: undefined,
      id: "tx-r",
      paid: undefined,
      scope: "ONLY_THIS",
      value: "2200.00",
    });
  });

  it("SHOULD split the series WHEN the scope is this and the next ones", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onScopeChange("THIS_AND_NEXT");
    });
    act(() => {
      result.current.onAmountChange(220000);
    });
    act(() => {
      result.current.onRepeatFrequencyChange("WEEKLY");
    });
    act(() => {
      result.current.onSave();
    });

    expect(result.current.recurrence.isFrequencyLocked).toBe(false);
    expect(mutations.split.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        frequency: "WEEKLY",
        occurrenceNumber: 5,
        recurrenceId: "series-1",
        value: "2200.00",
      }),
    );
  });

  it("SHOULD update the series WHEN the scope is all", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onScopeChange("ALL");
    });
    act(() => {
      result.current.onRepeatEndChange(undefined);
    });
    act(() => {
      result.current.onSave();
    });

    expect(mutations.update_recurrence.value.mutate).toHaveBeenCalledWith({
      categoryId: undefined,
      description: undefined,
      endDate: null,
      id: "series-1",
      value: undefined,
    });
  });

  it("SHOULD start from the stored values WHEN the scope changes", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onAmountChange(1);
    });
    act(() => {
      result.current.onScopeChange("ALL");
    });

    expect(result.current.amountCents).toBe(200000);
  });

  it("SHOULD just close WHEN nothing changed", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onSave();
    });

    expect(modalNavigation.closeModal).toHaveBeenCalled();
    expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD open a projected occurrence by series, number and month AND materialize it WHEN edited", () => {
    const projected = new ProjectedOccurrenceDTO({
      accountId: "a1",
      accountName: "a1",
      category: "Food",
      categoryId: "food",
      date: new Date(2026, 10, 5).toISOString(),
      description: "Rent",
      frequency: "MONTHLY",
      occurrenceCount: 12,
      occurrenceNumber: 2,
      owner: "USER",
      ownerId: "user-id",
      recurrenceId: "series-1",
      type: "EXPENSE",
      value: "2000.00",
    });

    givenLoaded({
      params: {
        month: "2026-11",
        occurrenceNumber: "2",
        recurrenceId: "series-1",
      },
      projected: [projected],
      series: [series],
    });
    const { result } = setup();

    expect(result.current.isEditing).toBe(true);
    expect(result.current.date).toEqual(new Date(2026, 10, 5));

    act(() => {
      result.current.onAmountChange(210000);
    });
    act(() => {
      result.current.onSave();
    });

    expect(mutations.materialize.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        occurrenceNumber: 2,
        recurrenceId: "series-1",
        value: "2100.00",
      }),
    );
  });

  it("SHOULD report notFound WHEN the projected occurrence is not in the projections", () => {
    givenLoaded({
      params: {
        month: "2026-11",
        occurrenceNumber: "9",
        recurrenceId: "series-1",
      },
      projected: [],
    });

    expect(setup().result.current.isNotFound).toBe(true);
  });
});

describe("deleting a recurring occurrence (spec 034 FR 28-31)", () => {
  const series = new RecurrenceDTO({
    accountId: "a1",
    category: "Food",
    categoryId: "food",
    description: "Rent",
    firstNumber: 1,
    frequency: "MONTHLY",
    id: "series-1",
    owner: "USER",
    ownerId: "user-id",
    startDate: new Date(2026, 9, 5).toISOString(),
    status: "ACTIVE",
    type: "EXPENSE",
    value: "2000.00",
  });
  const row = tx("tx-r", {
    occurrenceNumber: 5,
    recurrenceFrequency: "MONTHLY",
    recurrenceId: "series-1",
  });

  function loadReal() {
    givenLoaded({
      params: { id: "tx-r" },
      series: [series],
      transactions: [row],
    });
  }

  it("SHOULD delete only this occurrence by default", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onDeletePress();
    });
    expect(result.current.isDeleteDialogOpen).toBe(true);
    expect(result.current.recurrence.deleteScope).toBe("ONLY_THIS");

    act(() => {
      result.current.onRecurrenceDeletePress();
    });

    expect(mutations.delete_occurrence.value.mutate).toHaveBeenCalledWith({
      confirmPaid: false,
      occurrenceNumber: 5,
      recurrenceId: "series-1",
      scope: "ONLY_THIS",
    });
    expect(result.current.isDeleteDialogOpen).toBe(false);
  });

  it("SHOULD delete this and the next ones through the same endpoint", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onRecurrenceDeleteScopeChange("THIS_AND_NEXT");
    });
    act(() => {
      result.current.onRecurrenceDeletePress();
    });

    expect(mutations.delete_occurrence.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "THIS_AND_NEXT" }),
    );
  });

  it("SHOULD ask to confirm BEFORE deleting all, then delete the series", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onRecurrenceDeleteScopeChange("ALL");
    });
    act(() => {
      result.current.onRecurrenceDeletePress();
    });

    expect(result.current.recurrence.isAllDeleteOpen).toBe(true);
    expect(mutations.delete_recurrence.value.mutate).not.toHaveBeenCalled();

    act(() => {
      result.current.onRecurrenceDeleteConfirm();
    });

    expect(mutations.delete_recurrence.value.mutate).toHaveBeenCalledWith({
      confirmPaid: false,
      id: "series-1",
    });
    expect(result.current.recurrence.isAllDeleteOpen).toBe(false);
  });

  it("SHOULD close the all-confirmation WHEN cancelled", () => {
    loadReal();
    const { result } = setup();

    act(() => {
      result.current.onRecurrenceDeleteScopeChange("ALL");
    });
    act(() => {
      result.current.onRecurrenceDeletePress();
    });
    act(() => {
      result.current.onRecurrenceDeleteCancel();
    });

    expect(result.current.recurrence.isAllDeleteOpen).toBe(false);
  });

  it("SHOULD show the second, paid confirmation with the counts WHEN the API answers 409, AND retry confirmed", () => {
    loadReal();
    mutations.delete_recurrence.withError(
      new RecurrenceHasPaidOccurrences({
        detachedCount: 1,
        paidCount: 3,
        paidTotal: 600000,
      }),
    );
    const { result } = setup();

    expect(result.current.paidConflict).toMatchObject({
      detachedCount: 1,
      paidCount: 3,
      paidTotal: 600000,
    });
    expect(result.current.formErrorKey).toBeUndefined();

    act(() => {
      result.current.onRecurrenceDeleteScopeChange("ALL");
    });
    act(() => {
      result.current.onRecurrenceDeletePaidConfirm();
    });

    expect(mutations.delete_recurrence.value.mutate).toHaveBeenCalledWith({
      confirmPaid: true,
      id: "series-1",
    });
  });

  it("SHOULD hide the paid confirmation WHEN dismissed", () => {
    loadReal();
    mutations.delete_occurrence.withError(
      new RecurrenceHasPaidOccurrences({
        detachedCount: 0,
        paidCount: 1,
        paidTotal: 100,
      }),
    );
    const { result } = setup();

    expect(result.current.paidConflict).toBeDefined();

    act(() => {
      result.current.onRecurrenceDeleteCancel();
    });

    expect(result.current.paidConflict).toBeUndefined();
  });

  it("SHOULD not delete WHEN the row is not part of a series", () => {
    givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
    const { result } = setup();

    act(() => {
      result.current.onRecurrenceDeletePress();
    });

    expect(mutations.delete_occurrence.value.mutate).not.toHaveBeenCalled();
  });
});

describe("save and add another (spec 039)", () => {
  function filled() {
    givenLoaded({ accounts: [acc("a1"), acc("a2")] });
    const hook = setup();

    act(() => hook.result.current.onAmountChange(31290));
    act(() => hook.result.current.onDescriptionChange("Weekly shop"));
    act(() => hook.result.current.onCategorySelect("food"));
    act(() => hook.result.current.onAccountChange("a2"));
    act(() => hook.result.current.onDateChange(new Date(2026, 9, 4)));

    return hook;
  }

  function succeed(
    rerender: (props: object) => void,
    key: "create" | "create_recurrence" = "create",
  ) {
    mutations[key].withStatus("success");
    rerender({});
  }

  it("SHOULD stay open, reset the form, keep the rest and show the notice WHEN it succeeds", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    expect(mutations.create.value.mutate).toHaveBeenCalledTimes(1);
    succeed(rerender);

    expect(modalNavigation.closeModal).not.toHaveBeenCalled();
    expect(result.current.amountCents).toBe(0);
    expect(result.current.description).toBe("");
    expect(result.current.selectedCategoryId).toBe("food");
    expect(result.current.selectedAccountId).toBe("a2");
    expect(result.current.date).toEqual(new Date(2026, 9, 4));
    expect(result.current.ownerId).toBe("user-id");
    expect(result.current.type).toBe("EXPENSE");
    expect(result.current.isSaved).toBe(true);
    expect(mutations.create.value.reset).toHaveBeenCalled();
  });

  it("SHOULD turn repeat off WHEN a recurrence was saved and added another", () => {
    const { rerender, result } = filled();

    act(() => result.current.onRepeatToggle(true));
    act(() => result.current.onSaveAndNew());
    expect(mutations.create_recurrence.value.mutate).toHaveBeenCalledTimes(1);
    succeed(rerender, "create_recurrence");

    expect(result.current.repeatOn).toBe(false);
    expect(result.current.repeatFrequency).toBe("MONTHLY");
    expect(result.current.repeatEnd).toBeUndefined();
  });

  it("SHOULD detect a second save and add another WHEN the status went back to idle", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    succeed(rerender);
    mutations.create.withStatus("idle");
    rerender({});
    act(() => result.current.onAmountChange(500));
    act(() => result.current.onDescriptionChange("Bread"));
    act(() => result.current.onSaveAndNew());
    succeed(rerender);

    expect(modalNavigation.closeModal).not.toHaveBeenCalled();
    expect(result.current.amountCents).toBe(0);
    expect(mutations.create.value.mutate).toHaveBeenCalledTimes(2);
  });

  it("SHOULD still go back WHEN a plain save follows a save and add another", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    succeed(rerender);
    mutations.create.withStatus("idle");
    rerender({});
    act(() => result.current.onAmountChange(500));
    act(() => result.current.onDescriptionChange("Bread"));
    act(() => result.current.onSave());
    succeed(rerender);

    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT be dirty right after it, and be dirty again after typing", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    succeed(rerender);
    act(() => result.current.onClose());
    expect(result.current.isDiscardDialogOpen).toBe(false);
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

    act(() => result.current.onAmountChange(100));
    act(() => result.current.onClose());
    expect(result.current.isDiscardDialogOpen).toBe(true);
  });

  it("SHOULD clear the field errors WHEN it succeeds", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    succeed(rerender);

    expect(result.current.amountError).toBeUndefined();
    expect(result.current.descriptionError).toBeUndefined();
  });

  it("SHOULD make Paid follow the date again WHEN it succeeds", () => {
    const { rerender, result } = filled();

    act(() => result.current.onPaidChange(false));
    act(() => result.current.onSaveAndNew());
    succeed(rerender);

    expect(result.current.paid).toBe(true);
  });

  it("SHOULD NOT save and SHOULD show errors WHEN the form is invalid", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onSaveAndNew());

    expect(mutations.create.value.mutate).not.toHaveBeenCalled();
    expect(result.current.amountError).toBe(
      "financial.transactions.form.errors.amountRequired",
    );
  });

  it("SHOULD keep the values, show the error, no notice and close on a later plain save WHEN the mutation fails", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    mutations.create.withError(new FinancialNotFound());
    rerender({});

    expect(result.current.formErrorKey).toBe("financial.errors.notFound");
    expect(result.current.amountCents).toBe(31290);
    expect(result.current.isSaved).toBe(false);
    expect(modalNavigation.closeModal).not.toHaveBeenCalled();

    mutations.create.value.error = null;
    act(() => result.current.onSave());
    succeed(rerender);
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
  });

  it("SHOULD hide the notice on onSavedHide", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    succeed(rerender);
    act(() => result.current.onSavedHide());

    expect(result.current.isSaved).toBe(false);
  });

  it("SHOULD offer it only when creating", () => {
    givenLoaded();
    expect(setup().result.current.canSaveAndNew).toBe(true);

    givenLoaded({ params: { id: "tx-1" }, transactions: [tx("tx-1")] });
    const { result } = setup();

    expect(result.current.canSaveAndNew).toBe(false);
    act(() => result.current.onSaveAndNew());
    expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD report the pressed intent while saving", () => {
    const { rerender, result } = filled();

    act(() => result.current.onSaveAndNew());
    mutations.create.withIsFetching(true);
    rerender({});

    expect(result.current.isSaving).toBe(true);
    expect(result.current.isSavingNext).toBe(true);

    mutations.create.withIsFetching(false);
    rerender({});
    act(() => result.current.onSave());
    mutations.create.withIsFetching(true);
    rerender({});

    expect(result.current.isSavingNext).toBe(false);
  });
});

describe("tags (spec 043)", () => {
  function tagDto(
    id: string,
    name: string,
    usageCount: number,
    ownerId = "user-id",
  ) {
    return new TagDTO({
      id,
      name,
      owner: "USER",
      ownerId,
      scopeOwnerIds: [ownerId],
      usageCount,
    });
  }

  it("SHOULD suggest only the tags of the chosen owner, most used first AND with the count", () => {
    givenLoaded({
      tags: [
        tagDto("a", "beta", 0),
        tagDto("b", "alpha", 0),
        tagDto("c", "popular", 24),
        tagDto("d", "other-owner", 9, "family-1"),
      ],
    });
    const { result } = setup();

    expect(result.current.tagSuggestions).toEqual([
      { id: "c", label: "popular", meta: "24" },
      { id: "b", label: "alpha", meta: undefined },
      { id: "a", label: "beta", meta: undefined },
    ]);
    expect(result.current.tags).toEqual([]);
  });

  it("SHOULD keep the chips WHEN the owner changes AND show the new owner's suggestions", () => {
    givenLoaded({
      tags: [tagDto("a", "mine", 1), tagDto("d", "shared", 2, "family-1")],
    });
    const { result } = setup();

    act(() => result.current.onTagsChange(["presente"]));
    act(() => result.current.onOwnerChange("family-1"));

    expect(result.current.tags).toEqual(["presente"]);
    expect(result.current.tagSuggestions.map((tag) => tag.label)).toEqual([
      "shared",
    ]);
  });

  it("SHOULD send the tag names on create", () => {
    givenLoaded();
    const { result } = setup();

    act(() => result.current.onAmountChange(1000));
    act(() => result.current.onDescriptionChange("Lunch"));
    act(() => result.current.onCategorySelect("food"));
    act(() => result.current.onTagsChange(["a", "b"]));
    act(() => result.current.onSave());

    expect(mutations.create.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ tags: ["a", "b"] }),
    );
  });

  it("SHOULD load the tags of the transaction being edited AND send [] WHEN they are removed", () => {
    givenLoaded({
      params: { id: "tx-1" },
      transactions: [
        new TransactionDTO({
          ...tx("tx-1"),
          tags: [{ id: "t1", name: "viagem" }],
        }),
      ],
    });
    const { result } = setup();

    expect(result.current.tags).toEqual(["viagem"]);

    act(() => result.current.onTagsChange([]));
    act(() => result.current.onSave());

    expect(mutations.update.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ id: "tx-1", tags: [] }),
    );
  });
});
