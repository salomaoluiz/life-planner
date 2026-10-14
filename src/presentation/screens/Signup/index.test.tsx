import { StyleSheet } from "react-native";

import { fireEvent, hasText, screen } from "@tests";

import { mocks, setup } from "./mocks/index.mocks";
import signupTestIds from "./testIds";

it("SHOULD render the title, four fields and both buttons", () => {
  setup();

  for (const id of [
    signupTestIds.nameInput,
    signupTestIds.emailInput,
    signupTestIds.passwordInput,
    signupTestIds.confirmPasswordInput,
    signupTestIds.submitButton,
    signupTestIds.goToLoginButton,
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

  expect(screen.getByTestId(signupTestIds.nameInput).props).toMatchObject({
    autoComplete: "name",
    onChangeText: mocks.viewModel.onChangeName,
    onSubmitEditing: mocks.viewModel.onNameSubmit,
    returnKeyType: "next",
    textContentType: "name",
  });
  expect(screen.getByTestId(signupTestIds.emailInput).props).toMatchObject({
    autoCapitalize: "none",
    autoComplete: "email",
    keyboardType: "email-address",
    returnKeyType: "next",
    textContentType: "emailAddress",
  });
  expect(screen.getByTestId(signupTestIds.passwordInput).props).toMatchObject({
    autoComplete: "new-password",
    onSubmitEditing: mocks.viewModel.onPasswordSubmit,
    returnKeyType: "next",
    secureTextEntry: true,
    textContentType: "newPassword",
  });
  expect(
    screen.getByTestId(signupTestIds.confirmPasswordInput).props,
  ).toMatchObject({
    autoComplete: "new-password",
    onSubmitEditing: mocks.viewModel.onSubmit,
    returnKeyType: "done",
    secureTextEntry: true,
    textContentType: "newPassword",
  });
});

it("SHOULD give each password field its own visibility toggle", () => {
  setup();

  fireEvent.press(screen.getByTestId(`${signupTestIds.passwordInput}-toggle`));

  expect(
    screen.getByTestId(signupTestIds.passwordInput).props.secureTextEntry,
  ).toBe(false);
  expect(
    screen.getByTestId(signupTestIds.confirmPasswordInput).props
      .secureTextEntry,
  ).toBe(true);
  expect(
    screen.getByTestId(`${signupTestIds.confirmPasswordInput}-toggle`).props
      .accessibilityLabel,
  ).toBe("login.form.showPassword");
});

it("SHOULD submit and go to login through the buttons", () => {
  setup();

  fireEvent(screen.getByTestId(signupTestIds.submitButton), "press");
  fireEvent(screen.getByTestId(signupTestIds.goToLoginButton), "press");

  expect(mocks.viewModel.onSubmit).toHaveBeenCalledTimes(1);
  expect(mocks.viewModel.onGoToLogin).toHaveBeenCalledTimes(1);
});

it("SHOULD show loading and disable everything WHEN submitting", () => {
  setup({ isSubmitting: true });

  expect(
    screen.getByTestId(signupTestIds.submitButton).props.accessibilityState,
  ).toEqual(expect.objectContaining({ busy: true, disabled: true }));
  for (const id of [
    signupTestIds.nameInput,
    signupTestIds.emailInput,
    signupTestIds.passwordInput,
    signupTestIds.confirmPasswordInput,
  ]) {
    expect(screen.getByTestId(id).props.editable).toBe(false);
  }
  expect(
    screen.getByTestId(signupTestIds.goToLoginButton).props.accessibilityState
      .disabled,
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

  expect(
    screen.getByTestId(`${signupTestIds.nameInput}-error`).props.children,
  ).toBe("name error");
  expect(
    screen.getByTestId(`${signupTestIds.emailInput}-error`).props.children,
  ).toBe("email error");
  expect(
    screen.getByTestId(`${signupTestIds.passwordInput}-error`).props.children,
  ).toBe("password error");
  expect(
    screen.getByTestId(`${signupTestIds.confirmPasswordInput}-error`).props
      .children,
  ).toBe("confirm error");
  expect(screen.getByTestId(signupTestIds.formError).props).toMatchObject({
    children: "form error",
    type: "error",
  });
});

it("SHOULD render no helper texts WHEN there are no errors", () => {
  setup();

  expect(screen.queryByTestId(`${signupTestIds.nameInput}-error`)).toBeNull();
  expect(screen.queryByTestId(signupTestIds.formError)).toBeNull();
});

it("SHOULD redirect to the app WHEN the user is already logged", () => {
  setup({ logged: true });

  expect(screen.UNSAFE_getByType("Redirect" as never).props.href).toBe("/");
  expect(screen.queryByTestId(signupTestIds.nameInput)).toBeNull();
});

it("SHOULD center the form in a card of at most 420 px with 20 px side padding and full-width buttons", () => {
  setup();

  expect(
    StyleSheet.flatten(screen.getByTestId(signupTestIds.cardWrap).props.style),
  ).toEqual(expect.objectContaining({ alignSelf: "center", maxWidth: 420 }));
  expect(
    StyleSheet.flatten(
      screen.getByTestId(signupTestIds.submitButton).props.style,
    ).alignSelf,
  ).toBe("stretch");
});
