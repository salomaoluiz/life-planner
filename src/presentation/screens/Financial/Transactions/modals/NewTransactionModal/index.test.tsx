import { fireEvent, screen, setup } from "./mocks/index.mocks";

it("SHOULD show the create title and the save expense footer", () => {
  setup();

  expect(
    screen.getByText("financial.transactions.form.newTitle"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.saveExpense"),
  ).toBeOnTheScreen();
  expect(screen.queryByText("financial.transactions.delete")).toBeNull();
});

it("SHOULD show the save income label", () => {
  setup({
    saveLabelKey: "financial.transactions.form.saveIncome",
    typeTone: "income",
  });

  expect(
    screen.getByText("financial.transactions.form.saveIncome"),
  ).toBeOnTheScreen();
});

it("SHOULD show the edit title, save changes and the delete button", () => {
  setup({
    isEditing: true,
    saveLabelKey: "financial.common.saveChanges",
    titleKey: "financial.transactions.form.editTitle",
  });

  expect(
    screen.getByText("financial.transactions.form.editTitle"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.common.saveChanges")).toBeOnTheScreen();
  expect(screen.getByText("financial.transactions.delete")).toBeOnTheScreen();
});

it("SHOULD NOT render a Cancel button", () => {
  setup();

  expect(screen.queryByText("common.actions.cancel")).toBeNull();
  expect(screen.queryByText("Cancel")).toBeNull();
});

it("SHOULD call onSave from the footer and onDeletePress from the delete button", () => {
  const vm = setup({ isEditing: true });

  fireEvent.press(screen.getByText("financial.transactions.form.saveExpense"));
  fireEvent.press(screen.getByText("financial.transactions.delete"));

  expect(vm.onSave).toHaveBeenCalledTimes(1);
  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD render field errors and the form-level error", () => {
  setup({
    amountError: "financial.transactions.form.errors.amountRequired",
    categoryError: "financial.transactions.form.errors.categoryRequired",
    descriptionError: "financial.transactions.form.errors.descriptionRequired",
    formErrorKey: "financial.errors.notFound",
  });

  expect(
    screen.getByText("financial.transactions.form.errors.amountRequired"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.errors.categoryRequired"),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("financial.transactions.form.errors.descriptionRequired"),
  ).toBeOnTheScreen();
  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
});

it("SHOULD show skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(
    screen.getByText("financial.transactions.form.newTitle"),
  ).toBeOnTheScreen();
  expect(screen.getAllByTestId("transaction-form-skeleton")).toHaveLength(3);
});

it("SHOULD show the not found copy and close from it", () => {
  const vm = setup({ isNotFound: true });

  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();
  fireEvent.press(screen.getAllByText("common.actions.close")[0]);

  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD show the category hint WHEN the owner has no categories and create from it", () => {
  const vm = setup({ hasNoCategories: true });

  expect(
    screen.getByText("financial.transactions.form.noCategories"),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByText("financial.transactions.form.createCategory"),
  );

  expect(vm.onCreateCategoryPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the account hint WHEN the owner has no accounts and create from it", () => {
  const vm = setup({ hasNoAccounts: true });

  expect(
    screen.getByText("financial.transactions.form.noAccounts"),
  ).toBeOnTheScreen();
  fireEvent.press(
    screen.getByText("financial.transactions.form.createAccount"),
  );

  expect(vm.onCreateAccountPress).toHaveBeenCalledTimes(1);
});

it("SHOULD open the category picker from the More chip", () => {
  const vm = setup();

  fireEvent.press(
    screen.getByText("financial.transactions.form.moreCategories"),
  );

  expect(vm.onCategoryPickerOpen).toHaveBeenCalledTimes(1);
});

it("SHOULD render the category picker WHEN open", () => {
  setup({ isCategoryPickerOpen: true });

  expect(
    screen.getByText("financial.transactions.form.chooseCategory"),
  ).toBeOnTheScreen();
});

it("SHOULD render the delete dialog and confirm", () => {
  const vm = setup({ isDeleteDialogOpen: true, isEditing: true });

  expect(
    screen.getByText("financial.transactions.deleteTitle"),
  ).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.actions.delete"));

  expect(vm.onDeleteConfirm).toHaveBeenCalledTimes(1);
});

it("SHOULD render the discard dialog with its actions", () => {
  const vm = setup({ isDiscardDialogOpen: true });

  expect(screen.getByText("common.form.discardTitle")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("common.form.discard"));
  fireEvent.press(screen.getByText("common.form.keepEditing"));

  expect(vm.onDiscardConfirm).toHaveBeenCalledTimes(1);
  expect(vm.onDiscardCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD report the amount, description and owner changes", () => {
  const vm = setup();

  fireEvent.changeText(
    screen.getByLabelText("financial.transactions.form.description"),
    "Shop",
  );
  fireEvent.press(screen.getByText("financial.common.income"));

  expect(vm.onDescriptionChange).toHaveBeenCalledWith("Shop");
  expect(vm.onTypeChange).toHaveBeenCalledWith("INCOME");
});
