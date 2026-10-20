import { StyleSheet } from "react-native";

import { fireEvent, screen, setup, within } from "./mocks/index.mocks";
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
    cardFormTestIds.paymentAccount,
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

it("SHOULD warn that recurring transactions will end BEFORE archiving the card", () => {
  setup({ archiveWarningCount: 2, isEditing: true });

  expect(screen.getByTestId(cardFormTestIds.archiveWarning)).toBeOnTheScreen();
});

it("SHOULD show no archive warning WHEN there is nothing to end", () => {
  setup({ archiveWarningCount: 0, isEditing: true });

  expect(screen.queryByTestId(cardFormTestIds.archiveWarning)).toBeNull();
});

describe("wide layout (spec 037)", () => {
  const sheet = cardFormTestIds.sheet;

  it("SHOULD be a form dialog split into two columns, in field order", () => {
    setup({}, "expanded");

    expect(
      StyleSheet.flatten(screen.getByTestId(sheet).props.style).maxWidth,
    ).toBe(880);
    const left = within(screen.getByTestId(`${sheet}-column-left`));
    const right = within(screen.getByTestId(`${sheet}-column-right`));
    expect(left.getByTestId(cardFormTestIds.titleInput)).toBeOnTheScreen();
    expect(left.getByTestId(cardFormTestIds.brand)).toBeOnTheScreen();
    expect(
      right.getByTestId(cardFormTestIds.lastDigitsInput),
    ).toBeOnTheScreen();
    expect(right.getByTestId(cardFormTestIds.paymentDay)).toBeOnTheScreen();
  });

  it("SHOULD keep Delete in the footer on edit and out of it on create", () => {
    setup({ isEditing: true }, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).getByTestId(
        cardFormTestIds.deleteButton,
      ),
    ).toBeOnTheScreen();
    screen.unmount();

    setup({}, "expanded");
    expect(
      within(screen.getByTestId(`${sheet}-footer`)).queryByTestId(
        cardFormTestIds.deleteButton,
      ),
    ).toBeNull();
  });

  it("SHOULD keep Delete as the last item of the body on compact", () => {
    const vm = setup({ isEditing: true });
    fireEvent.press(
      within(screen.getByTestId(`${sheet}-body`)).getByTestId(
        cardFormTestIds.deleteButton,
      ),
    );
    expect(vm.onDeletePress).toHaveBeenCalledTimes(1);
  });
});
