import { fireEvent, render, screen } from "@tests";

import NewCreditCardModal from "../";
import { useNewCreditCardViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewCreditCardViewModel> = {
  archiveLabelKey: "financial.cardForm.archive",
  archiveWarningCount: 0,
  brand: "VISA",
  brandOptions: [{ labelKey: "financial.cards.brand.VISA", value: "VISA" }],
  closingDay: "",
  closingDayError: undefined,
  colorOptions: [{ labelKey: "financial.colors.indigo", value: "#6366F1" }],
  dayOptions: [{ label: "5", value: "5" }],
  deleteTitleParams: { title: "Main" },
  dueDay: "",
  dueDayError: undefined,
  formErrorKey: undefined,
  isDeleteDialogOpen: false,
  isDeleting: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isSaving: false,
  lastDigits: "",
  lastDigitsError: undefined,
  limitCents: 0,
  limitError: undefined,
  onArchiveToggle: jest.fn(),
  onBrandChange: jest.fn(),
  onClose: jest.fn(),
  onClosingDayChange: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onDueDayChange: jest.fn(),
  onLastDigitsChange: jest.fn(),
  onLimitChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onPaymentDayChange: jest.fn(),
  onSave: jest.fn(),
  onTintChange: jest.fn(),
  onTitleChange: jest.fn(),
  ownerChoices: [{ label: "Personal", value: "user-id" }],
  ownerId: "user-id",
  paymentDay: "",
  paymentDayOptions: [
    { labelKey: "financial.cardForm.paymentSameAsDue", value: "" },
  ],
  paymentWarning: false,
  saveLabelKey: "financial.cardForm.save",
  tint: "#6366F1",
  title: "",
  titleError: undefined,
  titleKey: "financial.cardForm.titleNew",
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewCreditCardViewModel).mockReturnValue(viewModel);
  render(<NewCreditCardModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup };
