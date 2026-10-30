import { fireEvent, render, screen } from "@tests";

import { SheetLayoutProvider } from "@components/BottomSheet/SheetLayoutContext";

import NotesField from "./index";

function setup(columns: 1 | 2, placement: "left" | "right", fluid = false) {
  const onChange = jest.fn();

  render(
    <SheetLayoutProvider value={{ columns, fluid }}>
      <NotesField onChange={onChange} placement={placement} value={"Casa"} />
    </SheetLayoutProvider>,
  );

  return { onChange };
}

it("SHOULD show in the left column WHEN the sheet is wide, with the counter and 4 lines", () => {
  setup(2, "left");

  expect(
    screen.getByTestId("financial.transactionForm.notesInput"),
  ).toBeTruthy();
  expect(
    screen.getByTestId("financial.transactionForm.notesInput-counter").props
      .children,
  ).toBe("4/1000");
});

it("SHOULD NOT show the right placement WHEN the sheet is wide, AND the opposite WHEN compact", () => {
  setup(2, "right");
  expect(
    screen.queryByTestId("financial.transactionForm.notesInput"),
  ).toBeNull();
});

it("SHOULD show the right placement WHEN compact", () => {
  setup(1, "right");
  expect(
    screen.getByTestId("financial.transactionForm.notesInput"),
  ).toBeTruthy();
});

it("SHOULD treat a fluid sheet as wide", () => {
  setup(1, "left", true);
  expect(
    screen.getByTestId("financial.transactionForm.notesInput"),
  ).toBeTruthy();
});

it("SHOULD cap the text at 1000 characters AND report the changes", () => {
  const { onChange } = setup(2, "left");
  const input = screen.getByTestId("financial.transactionForm.notesInput");

  expect(input.props.maxLength).toBe(1000);
  fireEvent.changeText(input, "Casa → Aeroporto");
  expect(onChange).toHaveBeenCalledWith("Casa → Aeroporto");
});
