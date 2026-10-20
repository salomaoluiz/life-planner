import { StyleSheet } from "react-native";

import { fireEvent, screen, setup, within } from "./mocks/index.mocks";
import categoryFormTestIds from "./testIds";

it("SHOULD show the create title, the save footer and no delete or cancel", () => {
  setup();

  expect(screen.getByText("financial.categories.new")).toBeOnTheScreen();
  expect(screen.getByText("financial.categories.form.save")).toBeOnTheScreen();
  expect(screen.queryByText("financial.categories.delete")).toBeNull();
  expect(screen.queryByText("common.actions.cancel")).toBeNull();
  [
    categoryFormTestIds.sheet,
    categoryFormTestIds.nameInput,
    categoryFormTestIds.namePreview,
    categoryFormTestIds.saveButton,
    `${categoryFormTestIds.type}-INCOME`,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
});

it("SHOULD show the edit title, save changes and the delete button", () => {
  const vm = setup({
    isEditing: true,
    saveLabelKey: "financial.common.saveChanges",
    titleKey: "financial.categories.edit",
  });

  expect(screen.getByText("financial.categories.edit")).toBeOnTheScreen();
  expect(screen.getByText("financial.common.saveChanges")).toBeOnTheScreen();
  expect(
    screen.getByTestId(categoryFormTestIds.deleteButton),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByText("financial.categories.delete"));

  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onSave from the footer", () => {
  const vm = setup();

  fireEvent.press(screen.getByText("financial.categories.form.save"));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD preview the placeholder or the typed name", () => {
  setup();
  expect(
    screen.getAllByText("financial.categories.form.namePlaceholder").length,
  ).toBeGreaterThan(0);
});

it("SHOULD preview the typed name", () => {
  setup({ name: "Food" });

  expect(screen.getAllByText("Food").length).toBeGreaterThan(0);
});

it("SHOULD report name and type changes", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.getByLabelText("financial.categories.form.name"),
    "Food",
  );
  fireEvent.press(screen.getByText("financial.common.income"));

  expect(vm.onNameChange).toHaveBeenCalledWith("Food");
  expect(vm.onTypeChange).toHaveBeenCalledWith("INCOME");
});

it("SHOULD show the type and owner helpers WHEN locked", () => {
  setup({
    isOwnerLocked: true,
    isTypeLocked: true,
    ownerHelperKey: "financial.common.ownerLocked",
    typeHelperKey: "financial.categories.form.typeLocked",
  });

  expect(
    screen.getByText("financial.categories.form.typeLocked"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.common.ownerLocked")).toBeOnTheScreen();
});

it("SHOULD offer the no-parent option first and report the parent", () => {
  const vm = setup();

  fireEvent.press(screen.getByTestId(categoryFormTestIds.parentSelect));
  expect(
    screen.getByTestId(`${categoryFormTestIds.parentSelect}-option-housing`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${categoryFormTestIds.parentSelect}-option-`),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByTestId(`${categoryFormTestIds.parentSelect}-option-housing`),
  );

  expect(vm.onParentChange).toHaveBeenCalledWith("housing");
});

it("SHOULD render swatches and the icon group and open the custom color and icon sheets", () => {
  const vm = setup();

  expect(
    screen.getByTestId(`${categoryFormTestIds.swatches}-swatch-#F59E0B`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${categoryFormTestIds.icon}-icon-car`),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(`${categoryFormTestIds.swatches}-custom`));
  fireEvent.press(screen.getByTestId(`${categoryFormTestIds.icon}-more`));
  fireEvent.press(
    screen.getByTestId(`${categoryFormTestIds.swatches}-swatch-#F59E0B`),
  );

  expect(vm.onCustomColorOpen).toHaveBeenCalledTimes(1);
  expect(vm.onIconPickerOpen).toHaveBeenCalledTimes(1);
  expect(vm.onColorChange).toHaveBeenCalledWith("#F59E0B");
});

it("SHOULD render the custom color sheet and the icon sheet only WHEN open", () => {
  setup();
  expect(
    screen.queryByText("financial.categories.form.customColorTitle"),
  ).toBeNull();

  setup({ isCustomColorOpen: true, isIconPickerOpen: true });

  expect(
    screen.getByText("financial.categories.form.customColorTitle"),
  ).toBeOnTheScreen();
  expect(
    screen.getAllByText("financial.categories.form.iconsTitle").length,
  ).toBeGreaterThan(0);
});

it("SHOULD render the name error and the form-level error", () => {
  setup({
    formErrorKey: "financial.errors.notFound",
    nameError: "financial.categories.nameRequired",
  });

  expect(
    screen.getByText("financial.categories.nameRequired"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
  expect(screen.getByTestId(categoryFormTestIds.formError)).toBeOnTheScreen();
  expect(
    screen.getByTestId(`${categoryFormTestIds.nameInput}-error`),
  ).toBeOnTheScreen();
});

it("SHOULD show skeletons WHEN loading and the not found copy WHEN missing", () => {
  setup({ isLoading: true });
  expect(screen.getAllByTestId("category-form-skeleton")).toHaveLength(3);
});

it("SHOULD show not found and close from it", () => {
  const vm = setup({ isNotFound: true });

  fireEvent.press(screen.getAllByText("common.actions.close")[0]);

  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD render the delete dialog with its message and confirm", () => {
  const vm = setup({
    deleteMessageKeys: [
      "financial.categories.deleteAlertMsg",
      "financial.categories.deleteConfirm.withSubcategories",
    ],
    isDeleteDialogOpen: true,
    isEditing: true,
  });

  expect(
    screen.getByText(
      "financial.categories.deleteAlertMsg financial.categories.deleteConfirm.withSubcategories",
    ),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByTestId(`${categoryFormTestIds.deleteDialog}-confirm`),
  );

  expect(vm.onDeleteConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD render the discard dialog with its actions", () => {
  const vm = setup({ isDiscardDialogOpen: true });

  fireEvent.press(screen.getByText("common.form.discard"));
  fireEvent.press(screen.getByText("common.form.keepEditing"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
  expect(vm.onDiscardCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD give every owner chip an id from its owner id", () => {
  setup({ ownerChoices: [{ label: "Test Family", value: "owner-2" }] });

  expect(
    screen.getByTestId(`${categoryFormTestIds.owner}-owner-2`),
  ).toBeOnTheScreen();
});

describe("wide layout (spec 037)", () => {
  const sheet = categoryFormTestIds.sheet;

  it("SHOULD be a form dialog split into two columns, in field order", () => {
    setup({}, "expanded");

    expect(
      StyleSheet.flatten(screen.getByTestId(sheet).props.style).maxWidth,
    ).toBe(880);
    const left = within(screen.getByTestId(`${sheet}-column-left`));
    const right = within(screen.getByTestId(`${sheet}-column-right`));
    expect(left.getByTestId(categoryFormTestIds.nameInput)).toBeOnTheScreen();
    expect(
      left.getByTestId(categoryFormTestIds.parentSelect),
    ).toBeOnTheScreen();
    expect(right.getByTestId(categoryFormTestIds.swatches)).toBeOnTheScreen();
    expect(right.getByTestId(categoryFormTestIds.icon)).toBeOnTheScreen();
  });

  it("SHOULD keep Delete in the footer on edit and out of it on create", () => {
    setup({ isEditing: true }, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).getByTestId(
        categoryFormTestIds.deleteButton,
      ),
    ).toBeOnTheScreen();
    screen.unmount();

    setup({}, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).queryByTestId(
        categoryFormTestIds.deleteButton,
      ),
    ).toBeNull();
  });

  it("SHOULD keep Delete as the last item of the body on compact", () => {
    const vm = setup({ isEditing: true });
    fireEvent.press(
      within(screen.getByTestId(`${sheet}-body`)).getByTestId(
        categoryFormTestIds.deleteButton,
      ),
    );
    expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
  });
});

describe("archive (spec 041)", () => {
  it("SHOULD show Archive on an active category AND Reactivate on an archived one, only when editing", () => {
    const vm = setup({ isEditing: true });
    fireEvent.press(screen.getByTestId(categoryFormTestIds.archiveButton));
    expect(vm.onArchivePress).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByTestId(categoryFormTestIds.reactivateButton),
    ).toBeNull();
    screen.unmount();

    const archived = setup({ isArchived: true, isEditing: true });
    fireEvent.press(screen.getByTestId(categoryFormTestIds.reactivateButton));
    expect(archived.onReactivatePress).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId(categoryFormTestIds.archiveButton)).toBeNull();
    screen.unmount();

    setup();
    expect(screen.queryByTestId(categoryFormTestIds.archiveButton)).toBeNull();
  });

  it("SHOULD confirm the archive from its dialog", () => {
    const vm = setup({ isArchiveDialogOpen: true, isEditing: true });

    fireEvent.press(
      screen.getByTestId(`${categoryFormTestIds.archiveDialog}-confirm`),
    );

    expect(vm.onArchiveConfirm).toHaveBeenCalledTimes(1);
  });

  it("SHOULD list the pending items AND close with the OK button", () => {
    const vm = setup({
      isEditing: true,
      pendingItems: {
        hiddenCount: 2,
        plans: [{ count: 4, description: "TV", id: "p1" }],
        recurrences: [{ date: "05/11", description: "Gym", id: "r1" }],
      },
    });

    expect(
      screen.getByTestId(categoryFormTestIds.pendingDialog),
    ).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-r1")).toBeOnTheScreen();
    expect(screen.getByTestId("pending-item-p1")).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(categoryFormTestIds.pendingOk));

    expect(vm.onPendingClose).toHaveBeenCalledTimes(1);
  });
});
