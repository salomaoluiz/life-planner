import { useTheme } from "@presentation/theme";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function iconColor(name: string) {
  return screen.UNSAFE_getAllByProps({ source: name })[0].props.color;
}

it("SHOULD pass its props to the list item hook", () => {
  const { item } = setup();

  expect(spies.useListItem).toHaveBeenCalledWith({
    item,
    refetch: mocks.refetch,
  });
});

it("SHOULD render the name, owner and formatted balance", () => {
  setup();

  expect(hasText("Checking")).toBe(true);
  expect(hasText("Alice Test (Personal)")).toBe(true);
  expect(hasText("$1,500.50")).toBe(true);
});

it("SHOULD use the primary color and no archived badge WHEN the account is active", () => {
  setup();

  expect(iconColor("bank")).toBe(useTheme().theme.colors.accent);
  expect(hasText("Archived")).toBe(false);
});

it("SHOULD use the muted color and show the archived badge WHEN the account is archived", () => {
  setup({ status: "ARCHIVED" });

  expect(iconColor("bank")).toBe(useTheme().theme.colors.border);
  expect(hasText("Archived")).toBe(true);
});

it("SHOULD call onEdit WHEN the edit button is pressed", () => {
  setup();

  fireEvent.press(
    screen.getAllByLabelText("financial.accounts.editAccount")[0],
  );

  expect(mocks.onEdit).toHaveBeenCalledTimes(1);
  expect(mocks.onDelete).not.toHaveBeenCalled();
});

it("SHOULD call onDelete WHEN the delete button is pressed", () => {
  setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.delete")[0]);

  expect(mocks.onDelete).toHaveBeenCalledTimes(1);
});
