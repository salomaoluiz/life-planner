import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import AdjustmentSheet from "./index";

function setup(
  overrides: Partial<React.ComponentProps<typeof AdjustmentSheet>> = {},
) {
  const props = {
    accountName: "Checking",
    amountCents: 5000,
    amountType: "INCOME" as const,
    cancelLabel: "Cancel",
    closeLabel: "Close",
    confirmLabel: "Delete",
    currency: "BRL" as const,
    deleteLabel: "Delete transaction",
    deleteMessage: "Deleting it reverses its effect on the account balance.",
    deleteTitle: "Delete this transaction?",
    isDeleting: false,
    onClose: jest.fn(),
    onDelete: jest.fn(),
    title: "Balance adjustment",
    ...overrides,
  };

  render(<AdjustmentSheet {...props} />);

  return props;
}

it("SHOULD offer ONLY a delete action (no edit)", () => {
  setup();

  expect(
    screen.getByTestId(transactionsTestIds.adjustmentSheet),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.adjustmentDelete),
  ).toBeOnTheScreen();
  expect(screen.getByText("Checking")).toBeOnTheScreen();
  expect(screen.queryByText("common.actions.save")).toBeNull();
});

it("SHOULD ask for confirmation before deleting AND delete only on confirm", () => {
  const props = setup();

  fireEvent.press(screen.getByTestId(transactionsTestIds.adjustmentDelete));
  expect(props.onDelete).not.toHaveBeenCalled();
  expect(screen.getByText(props.deleteMessage)).toBeOnTheScreen();

  fireEvent.press(
    screen.getByTestId(`${transactionsTestIds.adjustmentDeleteDialog}-confirm`),
  );
  expect(props.onDelete).toHaveBeenCalledTimes(1);
});

it("SHOULD show the delete error WHEN there is one", () => {
  setup({ errorMessage: "common.errors.generic" });

  expect(screen.getByText("common.errors.generic")).toBeOnTheScreen();
});
