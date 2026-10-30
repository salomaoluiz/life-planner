import { fireEvent, render, screen, within } from "@tests";

import { useBreakpoint } from "@presentation/theme";

import NewCategoryModal from "../";
import { useNewCategoryViewModel } from "../hooks";

jest.mock("../hooks");

const defaultViewModel: ReturnType<typeof useNewCategoryViewModel> = {
  applyColorOn: false,
  applyCount: 0,
  applyIconOn: false,
  applyName: "",
  applyPreview: [],
  archiveBodyKeys: ["financial.categories.archive.confirmBody"],
  colorOptions: [
    { labelKey: "financial.colors.amber", value: "#F59E0B" },
    { labelKey: "financial.colors.indigo", value: "#6366F1" },
  ],
  colorSwitchVisible: false,
  customColorDraft: "",
  customColorError: undefined,
  deleteConfirmLabelKey: "common.actions.delete",
  deleteMessageKeys: ["financial.categories.deleteAlertMsg"],
  deleteTitleParams: { name: "Food" },
  formErrorKey: undefined,
  hasChildren: false,
  icon: "folder",
  iconColor: "#6366F1",
  iconQuery: "",
  iconSwitchVisible: false,
  inlineIcons: [
    { label: "Folder", value: "folder" },
    { label: "Car", value: "car" },
  ],
  isApplyVisible: false,
  isArchived: false,
  isArchiveDialogOpen: false,
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
  isUpdating: false,
  name: "",
  nameError: undefined,
  onApplyColorToggle: jest.fn(),
  onApplyIconToggle: jest.fn(),
  onArchiveCancel: jest.fn(),
  onArchiveConfirm: jest.fn(),
  onArchivePress: jest.fn(),
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
  onPendingClose: jest.fn(),
  onReactivatePress: jest.fn(),
  onSave: jest.fn(),
  onTypeChange: jest.fn(),
  ownerChoices: [{ label: "Personal", labelKey: undefined, value: "user-id" }],
  ownerHelperKey: undefined,
  ownerId: "user-id",
  parentHelperKey: undefined,
  parentId: "",
  parentName: "",
  parentOptions: [{ depth: 0, label: "Housing", value: "housing" }],
  pendingItems: undefined,
  pickerIcons: [{ label: "Heart", value: "heart" }],
  saveLabelKey: "financial.categories.form.save",
  saveLabelParams: { count: 0 },
  titleKey: "financial.categories.new",
  toneOptions: [],
  type: "EXPENSE",
  typeHelperKey: undefined,
  typeOptions: [
    { labelKey: "financial.common.expense", value: "EXPENSE" },
    { labelKey: "financial.common.income", value: "INCOME" },
  ],
};

function setup(
  overrides: Partial<typeof defaultViewModel> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(useBreakpoint).mockReturnValue(breakpoint);
  const viewModel = { ...defaultViewModel, ...overrides };
  jest.mocked(useNewCategoryViewModel).mockReturnValue(viewModel);
  render(<NewCategoryModal />);

  return viewModel;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultViewModel, fireEvent, screen, setup, within };
