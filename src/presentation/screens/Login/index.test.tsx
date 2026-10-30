import { StyleSheet } from "react-native";

import { fireEvent, hasText, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";
import loginTestIds from "./testIds";

it("SHOULD render the welcome, both fields and both buttons", () => {
  setup();

  expect(screen.getByTestId(loginTestIds.welcome)).toBeOnTheScreen();
  expect(screen.getByTestId(loginTestIds.emailInput)).toBeOnTheScreen();
  expect(screen.getByTestId(loginTestIds.passwordInput)).toBeOnTheScreen();
  expect(screen.getByTestId(loginTestIds.submitButton)).toBeOnTheScreen();
  expect(screen.getByTestId(loginTestIds.goToSignupButton)).toBeOnTheScreen();
  expect(hasText("login.form.email")).toBe(true);
  expect(hasText("login.form.password")).toBe(true);
  expect(hasText("login.button.signIn")).toBe(true);
  expect(hasText("login.button.goToSignUp")).toBe(true);
});

it("SHOULD configure the email field for email entry", () => {
  setup();

  expect(screen.getByTestId(loginTestIds.emailInput).props).toMatchObject({
    autoCapitalize: "none",
    autoComplete: "email",
    keyboardType: "email-address",
    onChangeText: mocks.viewModel.onChangeEmail,
    onSubmitEditing: mocks.viewModel.onEmailSubmit,
    returnKeyType: "next",
    textContentType: "emailAddress",
    value: "test@example.com",
  });
});

it("SHOULD configure the password field as secure entry with its own show toggle", () => {
  setup();

  expect(screen.getByTestId(loginTestIds.passwordInput).props).toMatchObject({
    autoComplete: "password",
    onChangeText: mocks.viewModel.onChangePassword,
    onSubmitEditing: mocks.viewModel.onSubmit,
    returnKeyType: "done",
    secureTextEntry: true,
    textContentType: "password",
  });
  expect(
    screen.getByTestId(`${loginTestIds.passwordInput}-toggle`).props
      .accessibilityLabel,
  ).toBe("login.form.showPassword");
  fireEvent.press(screen.getByTestId(`${loginTestIds.passwordInput}-toggle`));
  expect(
    screen.getByTestId(loginTestIds.passwordInput).props.secureTextEntry,
  ).toBe(false);
  expect(
    screen.getByTestId(`${loginTestIds.passwordInput}-toggle`).props
      .accessibilityLabel,
  ).toBe("login.form.hidePassword");
});

it("SHOULD submit and navigate through the buttons", () => {
  setup();

  fireEvent(screen.getByTestId(loginTestIds.submitButton), "press");
  fireEvent(screen.getByTestId(loginTestIds.goToSignupButton), "press");

  expect(mocks.viewModel.onSubmit).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onGoToSignUp).toHaveBeenCalledTimes(1);
});

it("SHOULD show loading and disable everything WHEN submitting", () => {
  setup({ isSubmitting: true });

  expect(
    screen.getByTestId(loginTestIds.submitButton).props.accessibilityState,
  ).toEqual(expect.objectContaining({ busy: true, disabled: true }));
  expect(
    screen.getByTestId(loginTestIds.goToSignupButton).props.accessibilityState
      .disabled,
  ).toBe(true);
  expect(screen.getByTestId(loginTestIds.emailInput).props.editable).toBe(
    false,
  );
  expect(screen.getByTestId(loginTestIds.passwordInput).props.editable).toBe(
    false,
  );
});

it("SHOULD render field and form errors", () => {
  setup({
    emailError: "email error",
    formError: { message: "form error", type: "error" },
    passwordError: "password error",
  });

  expect(
    screen.getByTestId(`${loginTestIds.emailInput}-error`).props.children,
  ).toBe("email error");
  expect(
    screen.getByTestId(`${loginTestIds.passwordInput}-error`).props.children,
  ).toBe("password error");
  expect(screen.getByTestId(loginTestIds.formError).props).toMatchObject({
    children: "form error",
    type: "error",
  });
  expect(
    screen.getByTestId(loginTestIds.emailInput).props.accessibilityHint,
  ).toBe("email error");
});

it("SHOULD render the session expired notice as info", () => {
  setup({ formError: { message: "expired", type: "info" } });

  expect(screen.getByTestId(loginTestIds.formError).props.type).toBe("info");
});

it("SHOULD render no helper texts WHEN there are no errors", () => {
  setup();

  expect(screen.queryByTestId(`${loginTestIds.emailInput}-error`)).toBeNull();
  expect(screen.queryByTestId(loginTestIds.formError)).toBeNull();
});

it("SHOULD redirect to the app and render no form WHEN the user is already logged", () => {
  setup({ logged: true });

  expect(screen.UNSAFE_getByType("Redirect" as never).props.href).toBe("/");
  expect(screen.queryByTestId(loginTestIds.emailInput)).toBeNull();
});

it("SHOULD center the form in a card of at most 420 px with 20 px side padding and full-width buttons", () => {
  setup();

  expect(
    StyleSheet.flatten(screen.getByTestId(loginTestIds.cardWrap).props.style),
  ).toEqual(expect.objectContaining({ alignSelf: "center", maxWidth: 420 }));
  expect(
    StyleSheet.flatten(
      screen.getByTestId(loginTestIds.submitButton).props.style,
    ).alignSelf,
  ).toBe("stretch");
});

it("SHOULD render the account deleted notice as info WHEN the view model provides it", () => {
  setup({ accountDeletedNotice: "deleted" });

  const notice = screen.getByTestId(loginTestIds.accountDeletedNotice);
  expect(notice.props.type).toBe("info");
});

it("SHOULD NOT render the account deleted notice WHEN there is none", () => {
  setup();

  expect(screen.queryByTestId(loginTestIds.accountDeletedNotice)).toBeNull();
});

it("SHOULD render the plain versions line", () => {
  setup();

  expect(screen.getByTestId("versions")).toBeOnTheScreen();
});
