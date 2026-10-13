import { fireEvent, hasText, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";

it("SHOULD render the title, four fields and both buttons", () => {
  setup();

  for (const id of [
    "signup-name",
    "signup-email",
    "signup-password",
    "signup-confirm-password",
    "signup-submit",
    "signup-go-to-login",
  ]) {
    expect(screen.getByTestId(id)).toBeOnTheScreen();
  }
  expect(hasText("signup.title")).toBe(true);
  expect(hasText("signup.form.name")).toBe(true);
  expect(hasText("signup.form.confirmPassword")).toBe(true);
  expect(hasText("signup.button.submit")).toBe(true);
  expect(hasText("signup.button.goToLogin")).toBe(true);
});

it("SHOULD configure each field for autofill and keyboard chaining", () => {
  setup();

  expect(screen.getByTestId("signup-name").props).toMatchObject({
    autoComplete: "name",
    onChangeText: mocks.viewModel.onChangeName,
    onSubmitEditing: mocks.viewModel.onNameSubmit,
    returnKeyType: "next",
    textContentType: "name",
  });
  expect(screen.getByTestId("signup-email").props).toMatchObject({
    autoCapitalize: "none",
    autoComplete: "email",
    keyboardType: "email-address",
    returnKeyType: "next",
    textContentType: "emailAddress",
  });
  expect(screen.getByTestId("signup-password").props).toMatchObject({
    autoComplete: "new-password",
    onSubmitEditing: mocks.viewModel.onPasswordSubmit,
    returnKeyType: "next",
    secureTextEntry: true,
    textContentType: "newPassword",
  });
  expect(screen.getByTestId("signup-confirm-password").props).toMatchObject({
    autoComplete: "new-password",
    onSubmitEditing: mocks.viewModel.onSubmit,
    returnKeyType: "done",
    secureTextEntry: true,
    textContentType: "newPassword",
  });
});

it("SHOULD toggle the visibility of both password fields with one icon", () => {
  setup({ showPassword: true });

  const password = screen.getByTestId("signup-password").props;

  expect(password.secureTextEntry).toBe(false);
  expect(
    screen.getByTestId("signup-confirm-password").props.secureTextEntry,
  ).toBe(false);
  expect(password.right.props).toMatchObject({
    accessibilityLabel: "login.form.hidePassword",
    icon: "eye-off",
  });
  password.right.props.onPress();
  expect(mocks.viewModel.onTogglePassword).toHaveBeenCalledTimes(1);
});

it("SHOULD submit and go to login through the buttons", () => {
  setup();

  fireEvent(screen.getByTestId("signup-submit"), "press");
  fireEvent(screen.getByTestId("signup-go-to-login"), "press");

  expect(mocks.viewModel.onSubmit).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onGoToLogin).toHaveBeenCalledTimes(1);
});

it("SHOULD show loading and disable everything WHEN submitting", () => {
  setup({ isSubmitting: true });

  expect(screen.getByTestId("signup-submit").props.accessibilityState).toEqual(
    expect.objectContaining({ busy: true, disabled: true }),
  );
  for (const id of [
    "signup-name",
    "signup-email",
    "signup-password",
    "signup-confirm-password",
  ]) {
    expect(screen.getByTestId(id).props.disabled).toBe(true);
  }
  expect(
    screen.getByTestId("signup-go-to-login").props.accessibilityState.disabled,
  ).toBe(true);
});

it("SHOULD render every field error and the form error", () => {
  setup({
    confirmPasswordError: "confirm error",
    emailError: "email error",
    formError: "form error",
    nameError: "name error",
    passwordError: "password error",
  });

  expect(screen.getByTestId("signup-name-error").props.children).toBe(
    "name error",
  );
  expect(screen.getByTestId("signup-email-error").props.children).toBe(
    "email error",
  );
  expect(screen.getByTestId("signup-password-error").props.children).toBe(
    "password error",
  );
  expect(
    screen.getByTestId("signup-confirm-password-error").props.children,
  ).toBe("confirm error");
  expect(screen.getByTestId("signup-form-error").props).toMatchObject({
    children: "form error",
    type: "error",
  });
});

it("SHOULD render no helper texts WHEN there are no errors", () => {
  setup();

  expect(screen.queryByTestId("signup-name-error")).toBeNull();
  expect(screen.queryByTestId("signup-form-error")).toBeNull();
});

it("SHOULD redirect to the app WHEN the user is already logged", () => {
  setup({ logged: true });

  expect(screen.UNSAFE_getByType("Redirect" as never).props.href).toBe("/");
  expect(screen.queryByTestId("signup-name")).toBeNull();
});
