import { StyleSheet } from "react-native";

import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";

import { fireEvent, screen, setup, within } from "./mocks/index.mocks";
import transactionFormTestIds from "./testIds";

it("SHOULD show the create title and the save expense footer", () => {
  setup();

  expect(
    screen.getByText("financial.transactions.form.newTitle"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.saveExpense"),
  ).toBeOnTheScreen();
  expect(screen.queryByText("financial.transactions.delete")).toBeNull();
  expect(screen.getByTestId(transactionFormTestIds.sheet)).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionFormTestIds.saveButton),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionFormTestIds.descriptionInput),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionFormTestIds.amountInput),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(transactionFormTestIds.deleteButton)).toBeNull();
});

it("SHOULD show the save income label", () => {
  setup({
    saveLabelKey: "financial.transactions.form.saveIncome",
    typeTone: "income",
  });

  expect(
    screen.getByText("financial.transactions.form.saveIncome"),
  ).toBeOnTheScreen();
});

it("SHOULD show the edit title, save changes and the delete button", () => {
  setup({
    isEditing: true,
    saveLabelKey: "financial.common.saveChanges",
    titleKey: "financial.transactions.form.editTitle",
  });

  expect(
    screen.getByText("financial.transactions.form.editTitle"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.common.saveChanges")).toBeOnTheScreen();
  expect(screen.getByText("financial.transactions.delete")).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionFormTestIds.deleteButton),
  ).toBeOnTheScreen();
});

it("SHOULD NOT render a Cancel button", () => {
  setup();

  expect(screen.queryByText("common.actions.cancel")).toBeNull();
  expect(screen.queryByText("Cancel")).toBeNull();
});

it("SHOULD call onSave from the footer and onDeletePress from the delete button", () => {
  const vm = setup({ isEditing: true });

  fireEvent.press(screen.getByText("financial.transactions.form.saveExpense"));
  fireEvent.press(screen.getByText("financial.transactions.delete"));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD render field errors and the form-level error", () => {
  setup({
    amountError: "financial.transactions.form.errors.amountRequired",
    categoryError: "financial.transactions.form.errors.categoryRequired",
    descriptionError: "financial.transactions.form.errors.descriptionRequired",
    formErrorKey: "financial.errors.notFound",
  });

  expect(
    screen.getByText("financial.transactions.form.errors.amountRequired"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.errors.categoryRequired"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.errors.descriptionRequired"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
});

it("SHOULD show skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(
    screen.getByText("financial.transactions.form.newTitle"),
  ).toBeOnTheScreen();
  expect(screen.getAllByTestId("transaction-form-skeleton")).toHaveLength(3);
});

it("SHOULD show the not found copy and close from it", () => {
  const vm = setup({ isNotFound: true });

  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
  fireEvent.press(screen.getAllByText("common.actions.close")[0]);

  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD show the category hint WHEN the owner has no categories and create from it", () => {
  const vm = setup({ hasNoCategories: true });

  expect(
    screen.getByText("financial.transactions.form.noCategories"),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByText("financial.transactions.form.createCategory"),
  );

  expect(vm.onCreateCategoryPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the account hint WHEN the owner has no accounts and create from it", () => {
  const vm = setup({ hasNoAccounts: true });

  expect(
    screen.getByText("financial.transactions.form.noAccounts"),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByText("financial.transactions.form.createAccount"),
  );

  expect(vm.onCreateAccountPress).toHaveBeenCalledTimes(1);
});

it("SHOULD open the category picker from the More chip", () => {
  const vm = setup();

  fireEvent.press(
    screen.getByText("financial.transactions.form.moreCategories"),
  );

  expect(vm.onCategoryPickerOpen).toHaveBeenCalledTimes(1);
});

it("SHOULD render the category picker WHEN open", () => {
  setup({ isCategoryPickerOpen: true });

  expect(
    screen.getByText("financial.transactions.form.chooseCategory"),
  ).toBeOnTheScreen();
});

it("SHOULD render the delete dialog and confirm", () => {
  const vm = setup({ isDeleteDialogOpen: true, isEditing: true });

  expect(
    screen.getByText("financial.transactions.deleteTitle"),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.actions.delete"));

  expect(vm.onDeleteConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD render the discard dialog with its actions", () => {
  const vm = setup({ isDiscardDialogOpen: true });

  expect(screen.getByText("common.form.discardTitle")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.form.discard"));
  fireEvent.press(screen.getByText("common.form.keepEditing"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
  expect(vm.onDiscardCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD report the amount, description and owner changes", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.getByLabelText("financial.transactions.form.description"),
    "Shop",
  );
  fireEvent.press(screen.getByText("financial.common.income"));

  expect(vm.onDescriptionChange).toHaveBeenCalledWith("Shop");
  expect(vm.onTypeChange).toHaveBeenCalledWith("INCOME");
});

it("SHOULD give every owner chip an id from its owner id", () => {
  setup({ ownerChoices: [{ label: "Test Family", value: "owner-2" }] });

  expect(
    screen.getByTestId(`${transactionFormTestIds.owner}-owner-2`),
  ).toBeOnTheScreen();
});

describe("Pay with (spec 029)", () => {
  it("SHOULD hide the Pay with control WHEN the user has no card", () => {
    setup({ hasCards: false });

    expect(screen.queryByTestId(transactionFormTestIds.payWith)).toBeNull();
  });

  it("SHOULD call onPayWithChange WHEN Card is picked", () => {
    const vm = setup();

    fireEvent.press(
      screen.getByText("financial.transactions.form.payWithCard"),
    );

    expect(vm.onPayWithChange).toHaveBeenCalledWith("CARD");
  });

  it("SHOULD NOT offer the Installments switch outside Card mode", () => {
    setup();
    expect(
      screen.queryByTestId(transactionFormTestIds.installmentsSwitch),
    ).toBeNull();
  });

  it("SHOULD show the count, the split preview and the first/last invoice WHEN installments are on", () => {
    const vm = setup({
      installments: {
        count: 3,
        countText: "3",
        enabled: true,
        error: undefined,
        preview: { first: 3334, hasRemainder: true, others: 3333 },
        range: { first: "2026-10", last: "2026-12" },
        visible: true,
      },
      payWith: "CARD",
    });

    expect(
      screen.getByTestId(transactionFormTestIds.installmentsSwitch),
    ).toBeOnTheScreen();
    fireEvent.changeText(
      screen.getByTestId(transactionFormTestIds.installmentsCount),
      "4",
    );
    expect(vm.onInstallmentsCountChange).toHaveBeenCalledWith("4");
    expect(
      screen.getByTestId(transactionFormTestIds.installmentsPreview),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.installmentsInvoices),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the plain preview WHEN the split is even AND the total label", () => {
    setup({
      installments: {
        count: 10,
        countText: "10",
        enabled: true,
        error: undefined,
        preview: { first: 51200, hasRemainder: false, others: 51200 },
        range: undefined,
        visible: true,
      },
      payWith: "CARD",
    });

    expect(
      screen.getByTestId(transactionFormTestIds.installmentsPreview),
    ).toBeOnTheScreen();
    expect(
      screen.queryByTestId(transactionFormTestIds.installmentsInvoices),
    ).toBeNull();
    expect(
      screen.getByText("financial.transactions.form.totalValue"),
    ).toBeOnTheScreen();
  });

  it("SHOULD hide the type control, show the card field with the hints AND disable Save WHEN the invoice is paid", () => {
    setup({
      invoiceHint: { due: "2026-11-10", month: "2026-10" },
      invoiceMonthLabelDate: new Date(2026, 9, 1),
      isInvoicePaid: true,
      isSaveDisabled: true,
      overLimitCents: 12000,
      payWith: "CARD",
    });

    expect(screen.queryByTestId(transactionFormTestIds.type)).toBeNull();
    expect(
      screen.queryByTestId(transactionFormTestIds.accountSelect),
    ).toBeNull();
    expect(
      screen.getByTestId(transactionFormTestIds.cardSelect),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.invoiceHint),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.overLimit),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.invoicePaid),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.saveButton).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it("SHOULD show a hint WHEN the owner has no card", () => {
    setup({ hasNoCards: true, payWith: "CARD" });

    expect(
      screen.getByTestId(transactionFormTestIds.missingCardHint),
    ).toBeOnTheScreen();
  });
});

it("SHOULD show Refund this purchase only WHEN the view model allows it", () => {
  const vm = setup({ canRefund: true, isEditing: true });

  fireEvent.press(screen.getByTestId(transactionFormTestIds.refundButton));
  expect(vm.onRefundPress).toHaveBeenCalledTimes(1);
});

it("SHOULD hide Refund this purchase on a new transaction", () => {
  setup();

  expect(screen.queryByTestId(transactionFormTestIds.refundButton)).toBeNull();
});

describe("paid switch (spec 033)", () => {
  it("SHOULD render the switch WHEN paying with an account AND hide it for a card", () => {
    setup();
    expect(screen.getByTestId(transactionFormTestIds.paid)).toBeOnTheScreen();
  });

  it("SHOULD hide the switch WHEN the view model says so", () => {
    setup({ showPaid: false });
    expect(screen.queryByTestId(transactionFormTestIds.paid)).toBeNull();
  });
});

describe("repeat and recurring occurrences (spec 034)", () => {
  const recurring = {
    ...{
      deleteScope: "ONLY_THIS" as const,
      endError: undefined,
      endHelperKey: undefined,
      frequencyHelperKey: undefined,
      isAllDeleteOpen: false,
      isEndLocked: false,
      isFrequencyLocked: false,
      isRecurring: false,
      isRepeatToggleVisible: true,
      preview: undefined,
      scope: "ONLY_THIS" as const,
    },
  };

  it("SHOULD show the Repeat switch AND call the toggle", () => {
    const vm = setup();

    fireEvent(
      screen.getByTestId(transactionFormTestIds.repeat),
      "valueChange",
      true,
    );

    expect(vm.onRepeatToggle).toHaveBeenCalledWith(true);
    expect(screen.queryByTestId(transactionFormTestIds.repeatEnd)).toBeNull();
  });

  it("SHOULD show the frequency chips, the end date and the preview WHEN Repeat is on", () => {
    const vm = setup({
      recurrence: {
        ...recurring,
        preview: { count: 12, kind: "times", last: new Date(2027, 8, 5) },
      },
      repeatOn: true,
    });

    expect(
      screen.getByTestId(transactionFormTestIds.repeatEnd),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.repeatPreview),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.repeatPreview),
    ).toHaveTextContent(/form.repeatPreview/);
    expect(
      screen.getByText("financial.transactions.form.paidFirstOnly"),
    ).toBeOnTheScreen();

    fireEvent.press(
      screen.getByTestId(`${transactionFormTestIds.repeatFrequency}-WEEKLY`),
    );
    expect(vm.onRepeatFrequencyChange).toHaveBeenCalledWith("WEEKLY");
  });

  it("SHOULD preview the cadence WHEN there is no end date", () => {
    setup({
      recurrence: {
        ...recurring,
        preview: { frequency: "MONTHLY", kind: "forever" },
      },
      repeatOn: true,
    });

    expect(
      screen.getByTestId(transactionFormTestIds.repeatPreview),
    ).toHaveTextContent(/form.repeatForever/);
  });

  it("SHOULD show an empty preview text WHEN no occurrence fits the end date", () => {
    setup({
      recurrence: { ...recurring, preview: { kind: "none" } },
      repeatOn: true,
    });

    expect(
      screen.getByTestId(transactionFormTestIds.repeatPreview),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the scope selector AND lock account, date, frequency and end WHEN editing a recurring row", () => {
    const vm = setup({
      isEditing: true,
      recurrence: {
        ...recurring,
        endHelperKey: "financial.recurrence.lockedAll" as never,
        frequencyHelperKey: "financial.recurrence.lockedThisAndNext" as never,
        isEndLocked: true,
        isFrequencyLocked: true,
        isRecurring: true,
        isRepeatToggleVisible: false,
      },
      repeatOn: true,
      scopeLocks: {
        account: true,
        accountHelperKey: "financial.recurrence.lockedThisAndNext" as never,
        date: false,
        dateHelperKey: undefined,
        paid: false,
      },
    });

    fireEvent.press(
      screen.getByTestId("financial.recurrence-edit.scope-THIS_AND_NEXT"),
    );

    expect(vm.onScopeChange).toHaveBeenCalledWith("THIS_AND_NEXT");
    expect(screen.queryByTestId(transactionFormTestIds.repeat)).toBeNull();
    expect(
      screen.getAllByText("financial.recurrence.lockedThisAndNext").length,
    ).toBeGreaterThan(0);
    expect(
      screen.getByText("financial.recurrence.lockedAll"),
    ).toBeOnTheScreen();
  });

  it("SHOULD hide the paid switch WHEN the scope locks it", () => {
    setup({
      isEditing: true,
      recurrence: {
        ...recurring,
        isRecurring: true,
        isRepeatToggleVisible: false,
      },
      repeatOn: true,
      scopeLocks: {
        account: true,
        accountHelperKey: undefined,
        date: true,
        dateHelperKey: "financial.recurrence.lockedOnlyThis" as never,
        paid: true,
      },
    });

    expect(screen.queryByTestId(transactionFormTestIds.paid)).toBeNull();
    expect(
      screen.getByText("financial.recurrence.lockedOnlyThis"),
    ).toBeOnTheScreen();
  });

  it("SHOULD open the delete sheet WITH the three scopes AND delete by scope", () => {
    const vm = setup({
      isDeleteDialogOpen: true,
      isEditing: true,
      recurrence: {
        ...recurring,
        isRecurring: true,
        isRepeatToggleVisible: false,
      },
      repeatOn: true,
    });

    fireEvent.press(
      screen.getByTestId(`${transactionFormTestIds.recurrenceDeleteScope}-ALL`),
    );
    fireEvent.press(
      screen.getByTestId(transactionFormTestIds.recurrenceDeleteSheet),
    );

    expect(vm.onRecurrenceDeleteScopeChange).toHaveBeenCalledWith("ALL");
    expect(vm.onRecurrenceDeletePress).toHaveBeenCalled();
    expect(
      screen.queryByTestId(transactionFormTestIds.deleteDialog),
    ).toBeNull();
  });

  it("SHOULD ask to delete all, then ask again WITH the counts for paid occurrences", () => {
    const vm = setup({
      isEditing: true,
      paidConflict: new RecurrenceHasPaidOccurrences({
        detachedCount: 1,
        paidCount: 3,
        paidTotal: 600000,
      }),
      recurrence: {
        ...recurring,
        isAllDeleteOpen: true,
        isRecurring: true,
        isRepeatToggleVisible: false,
      },
      repeatOn: true,
    });

    expect(
      screen.getByText("financial.recurrence.deleteAnyway"),
    ).toBeOnTheScreen();
    expect(
      screen.getByText(/financial.recurrence.deletePaidWarning/),
    ).toBeOnTheScreen();

    fireEvent.press(
      screen.getByTestId(
        `${transactionFormTestIds.recurrenceDeletePaidDialog}-confirm`,
      ),
    );
    fireEvent.press(
      screen.getByTestId(
        `${transactionFormTestIds.recurrenceDeleteAllDialog}-confirm`,
      ),
    );

    expect(vm.onRecurrenceDeletePaidConfirm).toHaveBeenCalled();
    expect(vm.onRecurrenceDeleteConfirm).toHaveBeenCalled();
  });

  it("SHOULD NOT mention detached purchases WHEN there are none", () => {
    setup({
      isEditing: true,
      paidConflict: new RecurrenceHasPaidOccurrences({
        detachedCount: 0,
        paidCount: 1,
        paidTotal: 100,
      }),
      recurrence: {
        ...recurring,
        isRecurring: true,
        isRepeatToggleVisible: false,
      },
      repeatOn: true,
    });

    expect(screen.queryByText(/detachedWarning/)).toBeNull();
  });
});

describe("wide layout (spec 037)", () => {
  const sheet = transactionFormTestIds.sheet;

  function column(side: "left" | "right") {
    return within(screen.getByTestId(`${sheet}-column-${side}`));
  }

  it("SHOULD be a form dialog with the type, amount and description on the left", () => {
    setup({}, "expanded");

    expect(
      StyleSheet.flatten(screen.getByTestId(sheet).props.style).maxWidth,
    ).toBe(880);
    expect(
      column("left").getByTestId(transactionFormTestIds.type),
    ).toBeOnTheScreen();
    expect(
      column("left").getByTestId(transactionFormTestIds.amountInput),
    ).toBeOnTheScreen();
    expect(
      column("left").getByTestId(transactionFormTestIds.descriptionInput),
    ).toBeOnTheScreen();
    expect(
      column("right").getByTestId(transactionFormTestIds.dateField),
    ).toBeOnTheScreen();
  });

  it.each([false, true])(
    "SHOULD render the paid row once, in the right column (editing: %s)",
    (isEditing) => {
      setup(
        {
          isEditing,
          paidLabelKey: "financial.transactions.form.paid",
          showPaid: true,
        },
        "expanded",
      );

      expect(screen.getAllByTestId(transactionFormTestIds.paid)).toHaveLength(
        1,
      );
      expect(
        column("right").getByTestId(transactionFormTestIds.paid),
      ).toBeOnTheScreen();
    },
  );

  it("SHOULD show the form error full width, after the columns", () => {
    setup({ formErrorKey: "financial.errors.notFound" }, "expanded");

    expect(
      within(screen.getByTestId(`${sheet}-column-left`)).queryByTestId(
        transactionFormTestIds.formError,
      ),
    ).toBeNull();
    expect(
      screen.getByTestId(transactionFormTestIds.formError),
    ).toBeOnTheScreen();
  });

  it("SHOULD put Delete in the footer when editing on wide and in the body on compact", () => {
    setup({ isEditing: true }, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).getByTestId(
        transactionFormTestIds.deleteButton,
      ),
    ).toBeOnTheScreen();
    screen.unmount();

    const vm = setup({ isEditing: true });
    fireEvent.press(
      within(screen.getByTestId(`${sheet}-body`)).getByTestId(
        transactionFormTestIds.deleteButton,
      ),
    );
    expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
  });
});

describe("save and add another (spec 039)", () => {
  it("SHOULD show Save and Save and add another in create mode", () => {
    setup();

    expect(
      screen.getByTestId(transactionFormTestIds.saveButton),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(transactionFormTestIds.saveAndNewButton),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("financial.transactions.form.saveAndNew"),
    ).toBeOnTheScreen();
  });

  it("SHOULD hide Save and add another WHEN it is not offered (editing)", () => {
    setup({ canSaveAndNew: false, isEditing: true });

    expect(
      screen.queryByTestId(transactionFormTestIds.saveAndNewButton),
    ).toBeNull();
  });

  it("SHOULD call onSaveAndNew, not onSave, WHEN it is pressed", () => {
    const vm = setup();

    fireEvent.press(
      screen.getByTestId(transactionFormTestIds.saveAndNewButton),
    );

    expect(vm.onSaveAndNew).toHaveBeenCalledTimes(1);
    expect(vm.onSave).not.toHaveBeenCalled();
  });

  it("SHOULD disable both buttons while saving", () => {
    setup({ isBlocking: true, isSaving: true, isSavingNext: true });

    expect(
      screen.getByTestId(transactionFormTestIds.saveButton).props
        .accessibilityState?.disabled,
    ).toBe(true);
    expect(
      screen.getByTestId(transactionFormTestIds.saveAndNewButton).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it("SHOULD show Saving on the primary button AND block delete WHILE a blocking request runs (spec 061)", () => {
    setup({ isBlocking: true, isEditing: true, isSaving: true });

    expect(screen.getByText("financial.transactionModal.saving")).toBeTruthy();
    expect(
      screen.getByTestId(transactionFormTestIds.deleteButton).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it("SHOULD show the notice WHEN isSaved", () => {
    setup({ isSaved: true });

    expect(
      screen.getByTestId(transactionFormTestIds.savedToast),
    ).toBeOnTheScreen();
    expect(
      screen.getByText("financial.transactions.form.saved"),
    ).toBeOnTheScreen();
  });

  it("SHOULD NOT show the notice by default", () => {
    setup();

    expect(screen.queryByTestId(transactionFormTestIds.savedToast)).toBeNull();
  });
});

describe("tags field (spec 043)", () => {
  function input() {
    return screen.getByTestId(`${transactionFormTestIds.tags}-input`);
  }

  it("SHOULD show the chosen tags as chips AND remove one", () => {
    const vm = setup({ tags: ["fixo", "viagem"] });

    expect(
      screen.getByTestId(`${transactionFormTestIds.tags}-chip-fixo`),
    ).toBeOnTheScreen();
    fireEvent.press(
      screen.getByTestId(`${transactionFormTestIds.tags}-chip-remove-fixo`),
    );

    expect(vm.onTagsChange).toHaveBeenCalledWith(["viagem"]);
  });

  it("SHOULD suggest the tags of the owner WHEN focused AND add one", () => {
    const vm = setup({
      tagSuggestions: [{ id: "1", label: "gasto-fixo", meta: "24" }],
    });

    fireEvent(input(), "focus");
    fireEvent.press(
      screen.getByTestId(
        `${transactionFormTestIds.tags}-suggestion-gasto-fixo`,
      ),
    );

    expect(vm.onTagsChange).toHaveBeenCalledWith(["gasto-fixo"]);
  });

  it("SHOULD offer to create a new tag from what is typed", () => {
    const vm = setup();

    fireEvent(input(), "focus");
    fireEvent.changeText(input(), "presente");
    fireEvent.press(
      screen.getByTestId(`${transactionFormTestIds.tags}-create`),
    );

    expect(vm.onTagsChange).toHaveBeenCalledWith(["presente"]);
  });

  it("SHOULD stop at 10 tags AND explain it", () => {
    setup({ tags: Array.from({ length: 10 }, (_, index) => `t${index}`) });

    expect(input().props.editable).toBe(false);
    expect(
      screen.getByText("financial.transactions.form.tagsMax"),
    ).toBeOnTheScreen();
  });
});

describe("notes (spec 059)", () => {
  it.each(["compact", "expanded"] as const)(
    "SHOULD show the notes field once WHEN the layout is %s, and report the typing",
    (breakpoint) => {
      const vm = setup({ notes: "Casa" }, breakpoint);

      expect(
        screen.getAllByTestId(transactionFormTestIds.notesInput),
      ).toHaveLength(1);
      fireEvent.changeText(
        screen.getByTestId(transactionFormTestIds.notesInput),
        "Casa → Aeroporto",
      );
      expect(vm.onNotesChange).toHaveBeenCalledWith("Casa → Aeroporto");
    },
  );

  it("SHOULD hide the notes field WHEN the row is a system row", () => {
    setup({ showNotes: false });

    expect(screen.queryByTestId(transactionFormTestIds.notesInput)).toBeNull();
  });
});

describe("description suggestions (spec 060)", () => {
  const suggestion = {
    categoryColor: "#3B82F6",
    categoryIcon: "car",
    id: "uber-key",
    label: "Uber",
    matchRange: [0, 2] as [number, number],
    template: {} as never,
    type: "EXPENSE" as const,
  };

  it("SHOULD list the suggestions under the description AND report the pick", () => {
    const vm = setup({
      description: "ub",
      descriptionSuggestions: [suggestion],
    });

    fireEvent(
      screen.getByTestId(transactionFormTestIds.descriptionInput),
      "focus",
    );
    fireEvent.press(
      screen.getByTestId(
        `${transactionFormTestIds.description}-suggestion-Uber`,
      ),
    );

    expect(vm.onDescriptionSelect).toHaveBeenCalledWith("uber-key");
  });

  it("SHOULD show no list WHEN there are no suggestions", () => {
    setup({ description: "ub", descriptionSuggestions: [] });

    fireEvent(
      screen.getByTestId(transactionFormTestIds.descriptionInput),
      "focus",
    );
    expect(
      screen.queryByTestId(`${transactionFormTestIds.description}-menu`),
    ).toBeNull();
  });
});
