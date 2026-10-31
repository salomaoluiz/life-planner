import { act, fireEvent, render, screen } from "@tests";

import transactionsTestIds from "../testIds";
import ErrorToastHost from "./ErrorToastHost";
import { addFailure, resetPending } from "./pendingChanges";

beforeEach(() => {
  jest.useFakeTimers();
  resetPending();
});

afterEach(() => jest.useRealTimers());

it("SHOULD show nothing without a failure", () => {
  render(<ErrorToastHost />);
  expect(screen.queryByTestId(transactionsTestIds.errorToast)).toBeNull();
});

it("SHOULD show the save text AND run retry then dismiss WHEN Try again is pressed", () => {
  const retry = jest.fn();

  render(<ErrorToastHost />);
  act(() =>
    addFailure({ description: "Lunch", id: "1", kind: "create", retry }),
  );
  expect(screen.getByTestId(transactionsTestIds.errorToast)).toBeTruthy();
  expect(
    screen.getByText(
      'financial.transactions.error.save {"description":"Lunch"}',
    ),
  ).toBeTruthy();

  fireEvent.press(screen.getByTestId(transactionsTestIds.errorToastRetry));
  expect(retry).toHaveBeenCalledTimes(1);
  expect(screen.queryByTestId(transactionsTestIds.errorToast)).toBeNull();
});

it("SHOULD use the delete text for a failed delete AND the business copy when there is one", () => {
  render(<ErrorToastHost />);
  act(() =>
    addFailure({
      description: "Rent",
      id: "1",
      kind: "delete",
      retry: jest.fn(),
    }),
  );
  expect(
    screen.getByText(
      'financial.transactions.error.delete {"description":"Rent"}',
    ),
  ).toBeTruthy();

  act(() => jest.advanceTimersByTime(6000));
  act(() =>
    addFailure({
      description: "Rent",
      id: "2",
      kind: "create",
      messageKey: "financial.errors.accountArchived",
      retry: jest.fn(),
    }),
  );
  expect(screen.getByText("financial.errors.accountArchived")).toBeTruthy();
});

it("SHOULD show failures one after another, each hiding after 6 seconds", () => {
  render(<ErrorToastHost />);
  act(() => {
    addFailure({ description: "A", id: "1", kind: "create", retry: jest.fn() });
    addFailure({ description: "B", id: "2", kind: "edit", retry: jest.fn() });
  });
  act(() => jest.advanceTimersByTime(5999));
  expect(screen.getByTestId(transactionsTestIds.errorToast)).toBeTruthy();
  act(() => jest.advanceTimersByTime(1));
  expect(screen.getByTestId(transactionsTestIds.errorToast)).toBeTruthy();
  act(() => jest.advanceTimersByTime(6000));
  expect(screen.queryByTestId(transactionsTestIds.errorToast)).toBeNull();
});
