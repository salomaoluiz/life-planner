import { fireEvent, render, screen } from "@tests";

import NewCategoryModal from "../";
import { useNewCategoryViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewCategoryViewModel> = {
  colorOptions: [
    { labelKey: "financial.colors.amber", value: "#F59E0B" },
    { labelKey: "financial.colors.indigo", value: "#6366F1" },
  ],
  customColorDraft: "",
  customColorError: undefined,
  deleteMessageKeys: ["financial.categories.deleteAlertMsg"],
  deleteTitleParams: { name: "Food" },
  formErrorKey: undefined,
  hasChildren: false,
  icon: "folder",
  iconColor: "#6366F1",
  iconQuery: "",
  inlineIcons: [
    { label: "Folder", value: "folder" },
    { label: "Car", value: "car" },
  ],
  isCustomColorOpen: false,
  isDeleteDialogOpen: false,
  isDeleting: false,
  isDiscardDialogOpen: false,
  isEditing: false,
  isIconPickerOpen: false,
  isLoading: false,
  isNotFound: false,
  isOwnerLocked: false,
  isSaving: false,
  isTypeLocked: false,
  name: "",
  nameError: undefined,
  onClose: jest.fn(),
  onColorChange: jest.fn(),
  onCustomColorApply: jest.fn(),
  onCustomColorChange: jest.fn(),
  onCustomColorClose: jest.fn(),
  onCustomColorOpen: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onIconChange: jest.fn(),
  onIconPickerClose: jest.fn(),
  onIconPickerOpen: jest.fn(),
  onIconQueryChange: jest.fn(),
  onNameChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onParentChange: jest.fn(),
  onSave: jest.fn(),
  onTypeChange: jest.fn(),
  ownerChoices: [{ label: "Personal", labelKey: undefined, value: "user-id" }],
  ownerHelperKey: undefined,
  ownerId: "user-id",
  parentId: "",
  parentOptions: [{ depth: 0, label: "Housing", value: "housing" }],
  pickerIcons: [{ label: "Heart", value: "heart" }],
  saveLabelKey: "financial.categories.form.save",
  titleKey: "financial.categories.new",
  type: "EXPENSE",
  typeHelperKey: undefined,
  typeOptions: [
    { labelKey: "financial.common.expense", value: "EXPENSE" },
    { labelKey: "financial.common.income", value: "INCOME" },
  ],
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewCategoryViewModel).mockReturnValue(viewModel);
  render(<NewCategoryModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup };
