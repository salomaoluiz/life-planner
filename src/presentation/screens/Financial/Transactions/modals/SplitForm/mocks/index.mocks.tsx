import { fireEvent, render, screen } from "@tests";

import SplitForm from "../";
import { useSplitFormViewModel } from "../hooks";
import {
  createInitialState,
  newPart,
  SplitFormState,
} from "../models/splitFormState";

jest.mock("../hooks");

const noop = jest.fn();

function makeState(overrides: Partial<SplitFormState> = {}): SplitFormState {
  return {
    ...createInitialState(new Date(2026, 10, 15), { accountId: "acc-1" }),
    description: "Mercado",
    parts: [
      newPart("EXPENSE", { categoryId: "cat-1", cents: 12000 }),
      newPart("EXPENSE", { categoryId: "cat-2", cents: 5000 }),
    ],
    ...overrides,
  };
}

const defaultViewModel: ReturnType<typeof useSplitFormViewModel> = {
  canAddPart: true,
  canUndo: false,
  categoryOptions: () => [
    { label: "Mercearia", value: "cat-1" },
    { label: "Limpeza", value: "cat-2" },
  ],
  currency: "BRL",
  errorKey: undefined,
  errors: {},
  isBlocking: false,
  isCard: false,
  isDeleteDialogOpen: false,
  isDirty: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isLoading: false,
  isNotFound: false,
  isTotalTyped: false,
  isUndoDialogOpen: false,
  onAddPart: noop,
  onAdjust: noop,
  onAdjustmentKindChange: noop,
  onClose: noop,
  onDateChange: noop,
  onDeleteCancel: noop,
  onDeleteConfirm: noop,
  onDeletePress: noop,
  onDescriptionChange: noop,
  onDiscardCancel: noop,
  onDiscardConfirm: noop,
  onNotesChange: noop,
  onPaidChange: noop,
  onPartCategoryChange: noop,
  onPartDescriptionChange: noop,
  onPartPick: noop,
  onPartRemove: noop,
  onPartTagsChange: noop,
  onPartTypeChange: noop,
  onPartValueChange: noop,
  onSave: noop,
  onSourceChange: noop,
  onTotalPaidChange: noop,
  onTotalTypePress: noop,
  onUndoCancel: noop,
  onUndoConfirm: noop,
  onUndoPress: noop,
  remainingCents: 0,
  sourceOptions: [
    { label: "Checking · BRL", ownerId: "owner-1", value: "account:acc-1" },
  ],
  sourceValue: "account:acc-1",
  state: makeState(),
  sumCents: 17000,
  tagSuggestions: [],
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useSplitFormViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<SplitForm />);
}

export { defaultViewModel, fireEvent, makeState, noop, screen, setup };
