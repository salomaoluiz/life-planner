import { fireEvent, render, screen, within } from "@tests";

import { RecurrenceHasPaidOccurrences } from "@domain/entities/errors";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { TranslationKeys } from "@presentation/i18n/types";
import { useBreakpoint } from "@presentation/theme";

import NewTransactionModal from "../";
import { useNewTransactionViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewTransactionViewModel> = {
  accountError: undefined,
  accountOptions: [{ label: "Checking", value: "a1" }],
  amountCents: 0,
  amountError: undefined,
  amountInputRef: { current: null },
  canRefund: false,
  canSaveAndNew: true,
  cardError: undefined,
  cardOptions: [{ label: "Main ••1234", value: "c1" }],
  categoryChips: [{ colorDot: "#F59E0B", label: "Food", value: "food" }],
  categoryError: undefined,
  categoryPickerRows: [],
  categoryQuery: "",
  currency: "BRL",
  date: new Date(2026, 9, 5),
  dateError: undefined,
  dateLabelKey: "financial.transactions.form.date" as TranslationKeys,
  description: "",
  descriptionError: undefined,
  formErrorKey: undefined,
  hasCards: true,
  hasNoAccounts: false,
  hasNoCards: false,
  hasNoCategories: false,
  installments: {
    count: 2,
    countText: "2",
    enabled: false,
    error: undefined,
    preview: undefined,
    range: undefined,
    visible: false,
  },
  invoiceHint: undefined,
  invoiceMonthLabelDate: undefined,
  isCategoryPickerOpen: false,
  isDeleteDialogOpen: false,
  isDeleting: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isInvoicePaid: false,
  isLoading: false,
  isNotFound: false,
  isSaved: false,
  isSaveDisabled: false,
  isSaving: false,
  isSavingNext: false,
  onAccountChange: jest.fn(),
  onAmountChange: jest.fn(),
  onCardChange: jest.fn(),
  onCategoryPickerClose: jest.fn(),
  onCategoryPickerOpen: jest.fn(),
  onCategoryQueryChange: jest.fn(),
  onCategorySelect: jest.fn(),
  onClose: jest.fn(),
  onCreateAccountPress: jest.fn(),
  onCreateCategoryPress: jest.fn(),
  onDateChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDescriptionChange: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onInstallmentsCountChange: jest.fn(),
  onInstallmentsToggle: jest.fn(),
  onOwnerChange: jest.fn(),
  onPaidChange: jest.fn(),
  onPayWithChange: jest.fn(),
  onRecurrenceDeleteCancel: jest.fn(),
  onRecurrenceDeleteConfirm: jest.fn(),
  onRecurrenceDeletePaidConfirm: jest.fn(),
  onRecurrenceDeletePress: jest.fn(),
  onRecurrenceDeleteScopeChange: jest.fn(),
  onRefundPress: jest.fn(),
  onRepeatEndChange: jest.fn(),
  onRepeatFrequencyChange: jest.fn(),
  onRepeatToggle: jest.fn(),
  onSave: jest.fn(),
  onSaveAndNew: jest.fn(),
  onSavedHide: jest.fn(),
  onScopeChange: jest.fn(),
  onTagsChange: jest.fn(),
  onTypeChange: jest.fn(),
  overLimitCents: 0,
  ownerChoices: [{ label: "Personal", labelKey: undefined, value: "user-id" }],
  ownerId: "user-id",
  paid: true,
  paidConflict: undefined as RecurrenceHasPaidOccurrences | undefined,
  paidHelpKey: "financial.transactions.form.paidHelpCreate" as TranslationKeys,
  paidHintKey: undefined as TranslationKeys | undefined,
  paidLabelKey: "financial.transactions.form.paid" as TranslationKeys,
  payWith: "ACCOUNT" as "ACCOUNT" | "CARD",
  recurrence: {
    deleteScope: "ONLY_THIS" as "ALL" | "ONLY_THIS" | "THIS_AND_NEXT",
    endError: undefined as TranslationKeys | undefined,
    endHelperKey: undefined as TranslationKeys | undefined,
    frequencyHelperKey: undefined as TranslationKeys | undefined,
    isAllDeleteOpen: false,
    isEndLocked: false,
    isFrequencyLocked: false,
    isRecurring: false,
    isRepeatToggleVisible: true,
    preview: undefined as
      | undefined
      | { count: number; kind: "times"; last: Date }
      | { frequency: "MONTHLY"; kind: "forever" }
      | { kind: "none" },
    scope: "ONLY_THIS" as "ALL" | "ONLY_THIS" | "THIS_AND_NEXT",
  },
  repeatEnd: undefined as Date | undefined,
  repeatFrequency: "MONTHLY" as "BIWEEKLY" | "MONTHLY" | "WEEKLY" | "YEARLY",
  repeatOn: false,
  saveLabelKey: "financial.transactions.form.saveExpense",
  scopeLocks: undefined as
    | undefined
    | {
        account: boolean;
        accountHelperKey: TranslationKeys | undefined;
        date: boolean;
        dateHelperKey: TranslationKeys | undefined;
        paid: boolean;
      },
  selectedAccountId: "a1",
  selectedCardId: undefined,
  selectedCategoryId: undefined,
  showPaid: true,
  tags: [],
  tagSuggestions: [],
  titleKey: "financial.transactions.form.newTitle",
  type: TransactionType.EXPENSE,
  typeOptions: [
    { labelKey: "financial.common.expense", value: TransactionType.EXPENSE },
    { labelKey: "financial.common.income", value: TransactionType.INCOME },
  ],
  typeTone: "expense",
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewTransactionViewModel).mockReturnValue(viewModel);
  render(<NewTransactionModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup, within };
