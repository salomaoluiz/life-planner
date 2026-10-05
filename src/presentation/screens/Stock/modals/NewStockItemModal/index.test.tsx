import { act } from "@testing-library/react-native";

import { fireEvent, screen, setup } from "./mocks/index.mocks";

it("SHOULD render the sheet title and the main fields", () => {
  setup();

  expect(screen.getByText("stock.form.title")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.description")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.quantity")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.unit")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.owner")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.expiration")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.moreDetails")).toBeOnTheScreen();
});

it("SHOULD hide the extra fields until more details is open", () => {
  setup();

  expect(screen.queryByText("stock.form.purchase")).toBeNull();
  expect(screen.queryByText("stock.form.brand")).toBeNull();
});

it("SHOULD show the extra fields WHEN more details is open", () => {
  setup({ isMoreOpen: true });

  ["purchase", "opening", "brand", "barcode", "notes"].forEach((key) => {
    expect(screen.getByText(`stock.form.${key}`)).toBeOnTheScreen();
  });
});

it("SHOULD toggle more details", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByText("stock.form.moreDetails"));

  expect(vm.onToggleMore).toHaveBeenCalled();
});

it("SHOULD show the translated field errors", () => {
  setup({
    errors: {
      description: "stock.form.descriptionRequired",
      quantity: "stock.form.quantityRequired",
    },
  });

  expect(screen.getByText("stock.form.descriptionRequired")).toBeOnTheScreen();
  expect(screen.getByText("stock.form.quantityRequired")).toBeOnTheScreen();
});

it("SHOULD set the description", () => {
  const { vm } = setup();

  fireEvent.changeText(
    screen.getByLabelText("stock.form.description"),
    "Leite",
  );

  expect(vm.setField).toHaveBeenCalledWith("description", "Leite");
});

it("SHOULD accept digits and reject other characters in the quantity", () => {
  const { vm } = setup();
  const input = screen.getByLabelText("stock.form.quantity");

  fireEvent.changeText(input, "12");
  expect(vm.setField).toHaveBeenCalledWith("quantity", "12");

  vm.setField.mockClear();
  fireEvent.changeText(input, "1.5");
  fireEvent.changeText(input, "a");
  expect(vm.setField).not.toHaveBeenCalled();
});

it("SHOULD select the owner chip and change it", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByText("Silva"));

  expect(screen.getByText("stock.list.filter.personal")).toBeOnTheScreen();
  expect(vm.setField).toHaveBeenCalledWith("ownerId", "family-id");
});

it("SHOULD save and show loading state without a Cancel button", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByText("stock.form.save"));

  expect(vm.onSave).toHaveBeenCalled();
  expect(screen.queryByText("Cancel")).toBeNull();
  expect(screen.queryByText("common.actions.cancel")).toBeNull();
});

it("SHOULD mark the save button busy WHEN saving", () => {
  setup({ isSaving: true });

  expect(
    screen.getByRole("button", { busy: true, name: "stock.form.save" }),
  ).toBeOnTheScreen();
});

it("SHOULD render the form error", () => {
  setup({ formErrorKey: "common.errors.generic" });

  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();
});

it("SHOULD render the discard dialog wired to the view model", () => {
  const { vm } = setup({ isDiscardOpen: true });

  expect(screen.getByText("common.form.discardTitle")).toBeOnTheScreen();

  act(() => {
    fireEvent.press(screen.getByText("common.form.discard"));
  });
  expect(vm.onDiscard).toHaveBeenCalled();

  act(() => {
    fireEvent.press(screen.getByText("common.form.keepEditing"));
  });
  expect(vm.onKeepEditing).toHaveBeenCalled();
});

it("SHOULD close the sheet through the view model", () => {
  const { vm } = setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.close")[0]);

  expect(vm.onClose).toHaveBeenCalled();
});

it("SHOULD render a skeleton and no fields WHEN loading", () => {
  setup({ isLoading: true, model: undefined });

  expect(screen.getByText("stock.form.title")).toBeOnTheScreen();
  expect(screen.queryByText("stock.form.description")).toBeNull();
});
