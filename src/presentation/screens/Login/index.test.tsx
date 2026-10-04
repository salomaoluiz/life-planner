import { fireEvent, hasText, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render the welcome, both fields and both buttons", () => {
  setup();

  expect(screen.getByTestId("login_welcome")).toBeOnTheScreen();
  expect(screen.getByTestId("login-email")).toBeOnTheScreen();
  expect(screen.getByTestId("login-password")).toBeOnTheScreen();
  expect(screen.getByTestId("login-submit")).toBeOnTheScreen();
  expect(screen.getByTestId("login-go-to-signup")).toBeOnTheScreen();
  expect(hasText("login.form.email")).toBe(true);
  expect(hasText("login.form.password")).toBe(true);
  expect(hasText("login.button.signIn")).toBe(true);
  expect(hasText("login.button.goToSignUp")).toBe(true);
});

it("SHOULD configure the email field for email entry", () => {
  setup();

  expect(screen.getByTestId("login-email").props).toMatchObject({
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

it("SHOULD configure the password field as secure entry with a show toggle", () => {
  setup();

  const props = screen.getByTestId("login-password").props;

  expect(props).toMatchObject({
    autoComplete: "password",
    onChangeText: mocks.viewModel.onChangePassword,
    onSubmitEditing: mocks.viewModel.onSubmit,
    returnKeyType: "done",
    secureTextEntry: true,
    textContentType: "password",
  });
  expect(props.right.props).toMatchObject({
    accessibilityLabel: "login.form.showPassword",
    icon: "eye",
  });
  props.right.props.onPress();
  expect(mocks.viewModel.onTogglePassword).toHaveBeenCalledTimes(1);
});

it("SHOULD show the hide toggle and plain text WHEN the password is visible", () => {
  setup({ showPassword: true });

  const props = screen.getByTestId("login-password").props;

  expect(props.secureTextEntry).toBe(false);
  expect(props.right.props).toMatchObject({
    accessibilityLabel: "login.form.hidePassword",
    icon: "eye-off",
  });
});

it("SHOULD submit and navigate through the buttons", () => {
  setup();

  fireEvent(screen.getByTestId("login-submit"), "press");
  fireEvent(screen.getByTestId("login-go-to-signup"), "press");

  expect(mocks.viewModel.onSubmit).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onGoToSignUp).toHaveBeenCalledTimes(1);
});

it("SHOULD show loading and disable everything WHEN submitting", () => {
  setup({ isSubmitting: true });

  expect(screen.getByTestId("login-submit").props).toMatchObject({
    disabled: true,
    loading: true,
  });
  expect(screen.getByTestId("login-go-to-signup").props.disabled).toBe(true);
  expect(screen.getByTestId("login-email").props.disabled).toBe(true);
  expect(screen.getByTestId("login-password").props.disabled).toBe(true);
});

it("SHOULD render field and form errors", () => {
  setup({
    emailError: "email error",
    formError: { message: "form error", type: "error" },
    passwordError: "password error",
  });

  expect(screen.getByTestId("login-email-error").props.children).toBe(
    "email error",
  );
  expect(screen.getByTestId("login-password-error").props.children).toBe(
    "password error",
  );
  expect(screen.getByTestId("login-form-error").props).toMatchObject({
    children: "form error",
    type: "error",
  });
  expect(screen.getByTestId("login-email").props.error).toBe(true);
});

it("SHOULD render the session expired notice as info", () => {
  setup({ formError: { message: "expired", type: "info" } });

  expect(screen.getByTestId("login-form-error").props.type).toBe("info");
});

it("SHOULD render no helper texts WHEN there are no errors", () => {
  setup();

  expect(screen.queryByTestId("login-email-error")).toBeNull();
  expect(screen.queryByTestId("login-form-error")).toBeNull();
});

it("SHOULD redirect to the app and render no form WHEN the user is already logged", () => {
  setup({ logged: true });

  expect(screen.UNSAFE_getByType("Redirect" as never).props.href).toBe("/");
  expect(screen.queryByTestId("login-email")).toBeNull();
});
