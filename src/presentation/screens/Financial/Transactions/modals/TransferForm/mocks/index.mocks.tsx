import { fireEvent, render, screen } from "@tests";

import TransferForm from "../";
import { useTransferFormViewModel } from "../hooks";
import { createInitialState } from "../models/transferFormState";

jest.mock("../hooks");

const noop = jest.fn();
const onSwitchType = jest.fn();

const defaultViewModel: ReturnType<typeof useTransferFormViewModel> = {
  accountOptions: [
    { currency: "BRL", label: "Checking · BRL", value: "a1" },
    { currency: "BRL", label: "Savings · BRL", value: "a2" },
    {
      currency: "USD",
      description: "Family",
      label: "Global · USD",
      value: "a3",
    },
  ],
  amountInCents: 0,
  amountInReadOnly: false,
  canSaveAndNew: true,
  currencyIn: "BRL",
  currencyOut: "BRL",
  daysLater: 0,
  errorKey: undefined,
  errors: {},
  fromAccountId: "a1",
  isBlocking: false,
  isDeleteDialogOpen: false,
  isDirty: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isRecurring: false,
  isSaved: false,
  isSavingNext: false,
  onAccountSwap: noop,
  onAmountInChange: noop,
  onAmountOutChange: noop,
  onClose: noop,
  onDateInChange: noop,
  onDateOutChange: noop,
  onDeleteCancel: noop,
  onDeleteConfirm: noop,
  onDeletePress: noop,
  onDescriptionChange: noop,
  onDiscardCancel: noop,
  onDiscardConfirm: noop,
  onFeeChange: noop,
  onFromAccountChange: noop,
  onNotesChange: noop,
  onPaidChange: noop,
  onRateChange: noop,
  onRateModeChange: noop,
  onRepeatEndChange: noop,
  onRepeatFrequencyChange: noop,
  onRepeatToggle: noop,
  onSameDate: noop,
  onSave: noop,
  onSaveAndNew: noop,
  onSavedHide: noop,
  onScopeChange: noop,
  onToAccountChange: noop,
  rate: undefined,
  rateText: "",
  scope: "ONLY_THIS",
  state: { ...createInitialState(new Date(2026, 10, 4)), toAccountId: "a2" },
  toAccountId: "a2",
  typedAmountInText: "0.00",
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useTransferFormViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<TransferForm onSwitchType={onSwitchType} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, noop, onSwitchType, screen, setup };
