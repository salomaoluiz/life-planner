import { fireEvent, screen } from "@tests";

import { onAction, onChange, setup } from "./mocks/index.mocks";

it("SHOULD show the label and the selected invoice with its due date", () => {
  setup();

  expect(screen.getByTestId("invoice-label").props.children).toBe("Fatura");
  expect(screen.getByTestId("invoice-value").props.children).toBe(
    "Outubro · vence 10/11",
  );
  expect(screen.getByTestId("invoice-chevron")).toBeTruthy();
});

it("SHOULD list every invoice with its status chip and mark the selected one", () => {
  setup();
  expect(screen.queryByTestId("invoice-sheet")).toBeNull();

  fireEvent.press(screen.getByTestId("invoice"));

  expect(screen.getByText("Outubro · pela data")).toBeTruthy();
  expect(screen.getByText("Fecha 31/10 · vence 10/11")).toBeTruthy();
  expect(screen.getByText("Aberta")).toBeTruthy();
  expect(screen.getByText("Futura")).toBeTruthy();
  expect(screen.getByText("Paga")).toBeTruthy();
  expect(
    screen.getByTestId("invoice-option-2026-10").props.accessibilityState
      .selected,
  ).toBe(true);
  expect(
    screen.getByTestId("invoice-option-2026-11").props.accessibilityState
      .selected,
  ).toBe(false);
});

it("SHOULD call onChange with the month and close WHEN an option is pressed", () => {
  setup();
  fireEvent.press(screen.getByTestId("invoice"));

  fireEvent.press(screen.getByTestId("invoice-option-2026-11"));

  expect(onChange).toHaveBeenCalledWith("2026-11");
  expect(screen.queryByTestId("invoice-sheet")).toBeNull();
});

it("SHOULD show a paid invoice disabled with its reason AND never select it", () => {
  setup();
  fireEvent.press(screen.getByTestId("invoice"));

  expect(screen.getByText("Fatura paga, não recebe compras")).toBeTruthy();
  expect(
    screen.getByTestId("invoice-option-2026-09").props.accessibilityState
      .disabled,
  ).toBe(true);

  fireEvent.press(screen.getByTestId("invoice-option-2026-09"));

  expect(onChange).not.toHaveBeenCalled();
});

it("SHOULD show the hint with a link that resets the choice", () => {
  setup({
    hint: {
      actionLabel: "Usar a da data",
      onAction,
      text: "Pela data seria outubro.",
    },
  });

  expect(screen.getByText("Pela data seria outubro.")).toBeTruthy();

  fireEvent.press(screen.getByTestId("invoice-reset"));

  expect(onAction).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT show a hint WHEN none is given", () => {
  setup();

  expect(screen.queryByTestId("invoice-hint")).toBeNull();
});

it("SHOULD close the sheet from its close button without changing the value", () => {
  setup();
  fireEvent.press(screen.getByTestId("invoice"));

  fireEvent.press(screen.getByTestId("invoice-sheet-close"));

  expect(onChange).not.toHaveBeenCalled();
  expect(screen.queryByTestId("invoice-sheet")).toBeNull();
});
