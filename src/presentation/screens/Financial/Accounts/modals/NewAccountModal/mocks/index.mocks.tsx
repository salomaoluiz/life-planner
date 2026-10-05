import { fireEvent, render, screen } from "@tests";

import NewAccountModal from "../";
import { useNewAccountViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewAccountViewModel> = {
  amountCents: 0,
  amountError: undefined,
  balanceHelperKey: "financial.accounts.form.balanceHelper",
  deleteTitleParams: { name: "Main" },
  formErrorKey: undefined,
  icon: "bank",
  iconOptions: [
    { label: "Bank", value: "bank" },
    { label: "Wallet", value: "wallet" },
  ],
  isArchived: false,
  isDeleteDialogOpen: false,
  isDeleting: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isOwnerLocked: false,
  isSaving: false,
  name: "",
  nameError: undefined,
  onAmountChange: jest.fn(),
  onArchivedChange: jest.fn(),
  onClose: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onIconChange: jest.fn(),
  onNameChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onSave: jest.fn(),
  onSignChange: jest.fn(),
  ownerChoices: [{ label: "Personal", labelKey: undefined, value: "user-id" }],
  ownerHelperKey: undefined,
  ownerId: "user-id",
  saveLabelKey: "financial.accounts.form.save",
  sign: "POSITIVE",
  signOptions: [
    { labelKey: "financial.accounts.form.positive", value: "POSITIVE" },
    { labelKey: "financial.accounts.form.negative", value: "NEGATIVE" },
  ],
  titleKey: "financial.accounts.new",
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewAccountViewModel).mockReturnValue(viewModel);
  render(<NewAccountModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup };
