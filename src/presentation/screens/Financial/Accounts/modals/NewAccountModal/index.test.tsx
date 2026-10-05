import { fireEvent, screen, setup } from "./mocks/index.mocks";

it("SHOULD show the create title, the save footer and no delete, archive or cancel", () => {
  setup();

  expect(screen.getByText("financial.accounts.new")).toBeOnTheScreen();
  expect(screen.getByText("financial.accounts.form.save")).toBeOnTheScreen();
  expect(screen.queryByText("financial.accounts.delete")).toBeNull();
  expect(screen.queryByText("financial.accounts.form.archived")).toBeNull();
  expect(screen.queryByText("common.actions.cancel")).toBeNull();
});

it("SHOULD show the edit title, save changes, the archive switch and the delete button", () => {
  const vm = setup({
    isEditing: true,
    saveLabelKey: "financial.common.saveChanges",
    titleKey: "financial.accounts.edit",
  });

  expect(screen.getByText("financial.accounts.edit")).toBeOnTheScreen();
  expect(screen.getByText("financial.common.saveChanges")).toBeOnTheScreen();
  expect(
    screen.getByText("financial.accounts.form.archived"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.accounts.form.archivedHelper"),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByText("financial.accounts.delete"));

  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD call onSave from the footer", () => {
  const vm = setup();

  fireEvent.press(screen.getByText("financial.accounts.form.save"));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD preview the placeholder or the typed name", () => {
  setup();
  expect(
    screen.getAllByText("financial.accounts.form.name").length,
  ).toBeGreaterThan(0);

  setup({ name: "Main" });
  expect(screen.getAllByText("Main").length).toBeGreaterThan(0);
});

it("SHOULD report name, icon and sign changes", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.getByLabelText("financial.accounts.form.name"),
    "Main",
  );
  fireEvent.press(screen.getByTestId("account-icon-icon-wallet"));
  fireEvent.press(screen.getByText("financial.accounts.form.negative"));

  expect(vm.onNameChange).toHaveBeenCalledWith("Main");
  expect(vm.onIconChange).toHaveBeenCalledWith("wallet");
  expect(vm.onSignChange).toHaveBeenCalledWith("NEGATIVE");
});

it("SHOULD show the balance input, its helper and the amount error", () => {
  setup({ amountError: "financial.accounts.form.errors.balanceTooLarge" });

  expect(screen.getByTestId("account-balance")).toBeOnTheScreen();
  expect(
    screen.getByText("financial.accounts.form.balanceHelper"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.accounts.form.errors.balanceTooLarge"),
  ).toBeOnTheScreen();
});

it("SHOULD show the owner helper WHEN locked", () => {
  setup({
    isOwnerLocked: true,
    ownerHelperKey: "financial.common.ownerLocked",
  });

  expect(screen.getByText("financial.common.ownerLocked")).toBeOnTheScreen();
});

it("SHOULD render the name error and the form-level error", () => {
  setup({
    formErrorKey: "financial.accounts.errors.hasTransactions",
    nameError: "financial.accounts.nameRequired",
  });

  expect(screen.getByText("financial.accounts.nameRequired")).toBeOnTheScreen();
  expect(
    screen.getByText("financial.accounts.errors.hasTransactions"),
  ).toBeOnTheScreen();
});

it("SHOULD show skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("account-form-skeleton")).toHaveLength(3);
});

it("SHOULD show not found and close from it", () => {
  const vm = setup({ isNotFound: true });

  fireEvent.press(screen.getAllByText("common.actions.close")[0]);

  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD render the delete dialog and confirm", () => {
  const vm = setup({ isDeleteDialogOpen: true, isEditing: true });

  expect(
    screen.getByText("financial.accounts.deleteAlertMsg"),
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
