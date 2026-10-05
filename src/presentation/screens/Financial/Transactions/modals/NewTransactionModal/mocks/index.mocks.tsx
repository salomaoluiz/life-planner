import { fireEvent, render, screen } from "@tests";

import { TransactionType } from "@domain/entities/financial/TransactionEntity";

import NewTransactionModal from "../";
import { useNewTransactionViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewTransactionViewModel> = {
  accountError: undefined,
  accountOptions: [{ label: "Checking", value: "a1" }],
  amountCents: 0,
  amountError: undefined,
  categoryChips: [{ colorDot: "#F59E0B", label: "Food", value: "food" }],
  categoryError: undefined,
  categoryPickerRows: [],
  categoryQuery: "",
  date: new Date(2026, 9, 5),
  dateError: undefined,
  description: "",
  descriptionError: undefined,
  formErrorKey: undefined,
  hasNoAccounts: false,
  hasNoCategories: false,
  isCategoryPickerOpen: false,
  isDeleteDialogOpen: false,
  isDeleting: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  onAccountChange: jest.fn(),
  onAmountChange: jest.fn(),
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
  onOwnerChange: jest.fn(),
  onSave: jest.fn(),
  onTypeChange: jest.fn(),
  ownerChoices: [{ label: "Personal", labelKey: undefined, value: "user-id" }],
  ownerId: "user-id",
  saveLabelKey: "financial.transactions.form.saveExpense",
  selectedAccountId: "a1",
  selectedCategoryId: undefined,
  titleKey: "financial.transactions.form.newTitle",
  type: TransactionType.EXPENSE,
  typeOptions: [
    { labelKey: "financial.common.expense", value: TransactionType.EXPENSE },
    { labelKey: "financial.common.income", value: TransactionType.INCOME },
  ],
  typeTone: "expense",
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewTransactionViewModel).mockReturnValue(viewModel);
  render(<NewTransactionModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup };
