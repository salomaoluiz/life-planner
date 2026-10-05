import { fireEvent, screen, setup } from "./mocks/index.mocks";

it("SHOULD show the create title, the save footer and no delete or cancel", () => {
  setup();

  expect(screen.getByText("financial.categories.new")).toBeOnTheScreen();
  expect(screen.getByText("financial.categories.form.save")).toBeOnTheScreen();
  expect(screen.queryByText("financial.categories.delete")).toBeNull();
  expect(screen.queryByText("common.actions.cancel")).toBeNull();
});

it("SHOULD show the edit title, save changes and the delete button", () => {
  const vm = setup({
    isEditing: true,
    saveLabelKey: "financial.common.saveChanges",
    titleKey: "financial.categories.edit",
  });

  expect(screen.getByText("financial.categories.edit")).toBeOnTheScreen();
  expect(screen.getByText("financial.common.saveChanges")).toBeOnTheScreen();
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

  fireEvent.press(screen.getByText("financial.categories.form.noParent"));
  fireEvent.press(screen.getByText("Housing"));

  expect(vm.onParentChange).toHaveBeenCalledWith("housing");
});

it("SHOULD render swatches and the icon group and open the custom color and icon sheets", () => {
  const vm = setup();

  expect(screen.getByTestId("category-color-swatch-#F59E0B")).toBeOnTheScreen();
  expect(screen.getByTestId("category-icon-icon-car")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId("category-color-custom"));
  fireEvent.press(screen.getByTestId("category-icon-more"));
  fireEvent.press(screen.getByTestId("category-color-swatch-#F59E0B"));

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
  fireEvent.press(screen.getByText("common.actions.delete"));

  expect(vm.onDeleteConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD render the discard dialog with its actions", () => {
  const vm = setup({ isDiscardDialogOpen: true });

  fireEvent.press(screen.getByText("common.form.discard"));
  fireEvent.press(screen.getByText("common.form.keepEditing"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
  expect(vm.onDiscardCancel).toHaveBeenCalledTimes(1);
});
