import { fireEvent, screen } from "@tests";

import settingsTestIds from "../../testIds";
import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render only the destructive ghost action WHEN idle, and open dialog 1 on press", () => {
  setup();

  const button = screen.getByTestId(settingsTestIds.deleteAccountButton);
  expect(button).toBeOnTheScreen();
  expect(
    screen.queryByTestId(settingsTestIds.deleteAccountConfirmDialog),
  ).toBeNull();
  expect(
    screen.queryByTestId(settingsTestIds.deleteAccountEmailSheet),
  ).toBeNull();
  expect(
    screen.UNSAFE_getAllByProps({
      label: "configurations.deleteAccount.button",
    })[0].props,
  ).toMatchObject({ tone: "expense" });

  fireEvent.press(button);
  expect(mocks.viewModel.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the plain message WHEN the user owns no family", () => {
  setup({ step: "confirm" });

  expect(
    screen.getByTestId(`${settingsTestIds.deleteAccountConfirmDialog}-message`)
      .props.children,
  ).toBe("configurations.deleteAccount.confirmMessage");
});

it("SHOULD name the owned families in dialog 1 WHEN the user owns some", () => {
  setup({ ownedFamilies: "Mine, Also mine", step: "confirm" });

  const message = screen.getByTestId(
    `${settingsTestIds.deleteAccountConfirmDialog}-message`,
  ).props.children as string;
  expect(message).toContain(
    "configurations.deleteAccount.confirmOwnedFamilies",
  );
});

it("SHOULD continue and cancel from dialog 1", () => {
  setup({ step: "confirm" });

  fireEvent.press(
    screen.getByTestId(`${settingsTestIds.deleteAccountConfirmDialog}-confirm`),
  );
  fireEvent.press(
    screen.getByTestId(`${settingsTestIds.deleteAccountConfirmDialog}-cancel`),
  );

  expect(mocks.viewModel.onContinue).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD render the email sheet with an email input configured for emails", () => {
  setup({ step: "email" });

  expect(
    screen.getByTestId(settingsTestIds.deleteAccountEmailSheet),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(settingsTestIds.deleteAccountEmailInput).props,
  ).toMatchObject({
    autoCapitalize: "none",
    autoCorrect: false,
    keyboardType: "email-address",
  });
  expect(screen.queryByTestId(settingsTestIds.deleteAccountError)).toBeNull();
});

it("SHOULD keep submit disabled until the email matches, then enable it", () => {
  setup({ step: "email" });
  fireEvent.press(
    screen.getByTestId(settingsTestIds.deleteAccountSubmitButton),
  );
  expect(mocks.viewModel.onSubmit).not.toHaveBeenCalled();
});

it("SHOULD submit WHEN enabled AND forward typing and cancel", () => {
  setup({ canSubmit: true, step: "email" });

  fireEvent.changeText(
    screen.getByTestId(settingsTestIds.deleteAccountEmailInput),
    "a@b.com",
  );
  fireEvent.press(
    screen.getByTestId(settingsTestIds.deleteAccountSubmitButton),
  );
  fireEvent.press(
    screen.getByTestId(settingsTestIds.deleteAccountCancelButton),
  );

  expect(mocks.viewModel.onChangeEmail).toHaveBeenCalledWith("a@b.com");
  expect(mocks.viewModel.onSubmit).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onCancel).toHaveBeenCalledTimes(1);
});

it("SHOULD lock the sheet WHILE deleting (loading submit, disabled cancel and field)", () => {
  setup({ canSubmit: true, isDeleting: true, step: "email" });

  fireEvent.press(
    screen.getByTestId(settingsTestIds.deleteAccountSubmitButton),
  );
  fireEvent.press(
    screen.getByTestId(settingsTestIds.deleteAccountCancelButton),
  );

  expect(mocks.viewModel.onSubmit).not.toHaveBeenCalled();
  expect(mocks.viewModel.onCancel).not.toHaveBeenCalled();
  expect(
    screen.getByTestId(`${settingsTestIds.deleteAccountSubmitButton}-spinner`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(settingsTestIds.deleteAccountEmailInput).props.editable,
  ).toBe(false);
});

it("SHOULD show the mismatch field error AND the inline generic error", () => {
  setup({ hasError: true, mismatch: true, step: "email" });

  expect(
    screen.getByTestId(`${settingsTestIds.deleteAccountEmailInput}-error`),
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId(settingsTestIds.deleteAccountError),
  ).toBeOnTheScreen();
});
