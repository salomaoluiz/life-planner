import { fireEvent, screen, setup } from "./mocks/index.mocks";
import cardFormTestIds from "./testIds";

it("SHOULD show the create title, every field AND no archive or delete", () => {
  setup();

  expect(screen.getByText("financial.cardForm.titleNew")).toBeOnTheScreen();
  expect(screen.getByText("financial.cardForm.save")).toBeOnTheScreen();
  [
    cardFormTestIds.sheet,
    cardFormTestIds.preview,
    cardFormTestIds.titleInput,
    cardFormTestIds.limitInput,
    cardFormTestIds.brand,
    `${cardFormTestIds.owner}-user-id`,
    cardFormTestIds.lastDigitsInput,
    cardFormTestIds.swatches,
    cardFormTestIds.closingDay,
    cardFormTestIds.dueDay,
    cardFormTestIds.paymentDay,
    cardFormTestIds.saveButton,
  ].forEach((id) => expect(screen.getByTestId(id)).toBeOnTheScreen());
  expect(screen.queryByTestId(cardFormTestIds.archiveButton)).toBeNull();
  expect(screen.queryByTestId(cardFormTestIds.deleteButton)).toBeNull();
});

it("SHOULD reflect the typed title in the live preview", () => {
  setup({ title: "Travel" });

  expect(
    screen.getByTestId(`${cardFormTestIds.preview}-title`).props.children,
  ).toBe("Travel");
});

it("SHOULD call onSave and onTitleChange", () => {
  const vm = setup();

  fireEvent.changeText(screen.getByTestId(cardFormTestIds.titleInput), "Main");
  fireEvent.press(screen.getByTestId(cardFormTestIds.saveButton));

  expect(vm.onTitleChange).toHaveBeenCalledWith("Main");
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD show the payment warning only WHEN the view model says so", () => {
  setup({ paymentWarning: true });
  expect(
    screen.getByTestId(cardFormTestIds.paymentAfterDueWarning),
  ).toBeOnTheScreen();

  screen.unmount();
  setup({ paymentWarning: false });
  expect(
    screen.queryByTestId(cardFormTestIds.paymentAfterDueWarning),
  ).toBeNull();
});

it("SHOULD show archive and delete in edit mode and call their handlers", () => {
  const vm = setup({
    archiveLabelKey: "financial.cardForm.reactivate",
    isEditing: true,
  });

  expect(screen.getByText("financial.cardForm.reactivate")).toBeOnTheScreen();
  fireEvent.press(screen.getByTestId(cardFormTestIds.archiveButton));
  fireEvent.press(screen.getByTestId(cardFormTestIds.deleteButton));

  expect(vm.onArchiveToggle).toHaveBeenCalledTimes(1);
  expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the form error text", () => {
  setup({ formErrorKey: "financial.cards.delete.hasTransactions" });

  expect(screen.getByTestId(cardFormTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD show the not found state AND skeletons WHILE loading", () => {
  setup({ isNotFound: true });
  expect(screen.getByText("financial.errors.notFound")).toBeOnTheScreen();

  screen.unmount();
  setup({ isLoading: true });
  expect(screen.getAllByTestId("card-form-skeleton")).toHaveLength(3);
});
