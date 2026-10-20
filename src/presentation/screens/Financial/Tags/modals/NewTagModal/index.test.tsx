import { fireEvent, render, screen } from "@tests";

import NewTagModal from "./";
import { useNewTagViewModel } from "./hooks";
import tagFormTestIds from "./testIds";

jest.mock("./hooks");

const base: ReturnType<typeof useNewTagViewModel> = {
  deleteConfirmLabelKey: "financial.tagDelete.confirm",
  deleteMessageKey: "financial.tagDelete.unused",
  deleteTitleParams: { name: "fixo" },
  formErrorKey: undefined,
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
  onClose: jest.fn(),
  onDeleteCancel: jest.fn(),
  onDeleteConfirm: jest.fn(),
  onDeletePress: jest.fn(),
  onDiscardCancel: jest.fn(),
  onDiscardConfirm: jest.fn(),
  onNameChange: jest.fn(),
  onOwnerChange: jest.fn(),
  onSave: jest.fn(),
  ownerChoices: [
    { labelKey: "financial.common.personal", value: "user-id" },
    { labelKey: "financial.tags.all", value: "ALL" },
  ],
  ownerHelperKey: undefined,
  ownerId: "user-id",
  usage: 0,
};

function setup(overrides: Partial<typeof base> = {}) {
  jest.mocked(useNewTagViewModel).mockReturnValue({ ...base, ...overrides });

  return render(<NewTagModal />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the new tag form AND save", () => {
  setup();

  expect(screen.getByText("financial.tagForm.newTitle")).toBeOnTheScreen();
  expect(screen.queryByTestId(tagFormTestIds.deleteButton)).toBeNull();
  expect(screen.queryByTestId(tagFormTestIds.usage)).toBeNull();
  fireEvent.changeText(screen.getByTestId(tagFormTestIds.nameInput), "fixo");
  fireEvent.press(screen.getByTestId(tagFormTestIds.saveButton));

  expect(base.onNameChange).toHaveBeenCalledWith("fixo");
  expect(base.onSave).toHaveBeenCalled();
});

it("SHOULD choose the owner AND show its helper and the form error", () => {
  setup({
    formErrorKey: "common.errors.generic",
    nameError: "financial.tagForm.nameInUse",
    ownerHelperKey: "financial.tagForm.allHelper",
  });

  fireEvent.press(screen.getByTestId(`${tagFormTestIds.owner}-ALL`));

  expect(base.onOwnerChange).toHaveBeenCalledWith("ALL");
  expect(screen.getByText("financial.tagForm.allHelper")).toBeOnTheScreen();
  expect(screen.getByText("financial.tagForm.nameInUse")).toBeOnTheScreen();
  expect(screen.getByTestId(tagFormTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD show the usage AND the delete button WHEN editing", () => {
  setup({ isEditing: true, usage: 3 });

  expect(screen.getByText("financial.tagForm.editTitle")).toBeOnTheScreen();
  expect(screen.getByTestId(tagFormTestIds.usage)).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(tagFormTestIds.deleteButton));

  expect(base.onDeletePress).toHaveBeenCalled();
});

it("SHOULD show the delete confirmation", () => {
  setup({ isDeleteDialogOpen: true, isEditing: true });

  expect(screen.getByTestId(tagFormTestIds.deleteDialog)).toBeOnTheScreen();
});

it("SHOULD show skeletons WHEN loading AND an error WHEN the tag is missing", () => {
  setup({ isLoading: true });
  expect(screen.getAllByTestId("tag-form-skeleton")).toHaveLength(2);

  setup({ isLoading: false, isNotFound: true });
  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
});
