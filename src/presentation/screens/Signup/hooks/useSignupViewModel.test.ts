import {
  AutoLoginFailedError,
  ConnectivityError,
  EmailAlreadyInUseError,
  GenericError,
} from "@domain/entities/errors";

import {
  act,
  fillAll,
  mocks,
  runFetch,
  setup,
  spies,
} from "./mocks/useSignupViewModel.mocks";

it("SHOULD show every required error and NOT send a request WHEN submitting empty fields", () => {
  const { result } = setup();

  act(() => result.current.onSubmit());

  expect(result.current.nameError).toBe("auth.validation.nameRequired");
  expect(result.current.emailError).toBe("auth.validation.emailRequired");
  expect(result.current.passwordError).toBe("auth.validation.passwordRequired");
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD reject a password shorter than 8 and NOT send a request", () => {
  const { result } = setup();
  fillAll(result, { password: "1234567" });

  act(() => result.current.onSubmit());

  expect(result.current.passwordError).toBe("auth.validation.passwordLength");
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD reject a password longer than 72 and a whitespace-only name", () => {
  const { result } = setup();
  fillAll(result, { name: "   ", password: "a".repeat(73) });

  act(() => result.current.onSubmit());

  expect(result.current.passwordError).toBe("auth.validation.passwordLength");
  expect(result.current.nameError).toBe("auth.validation.nameRequired");
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD reject mismatched passwords and NOT send a request", () => {
  const { result } = setup();
  fillAll(result, { confirm: "different123" });

  act(() => result.current.onSubmit());

  expect(result.current.confirmPasswordError).toBe(
    "auth.validation.passwordsDontMatch",
  );
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD submit trimmed data and add a breadcrumb without field values", () => {
  const { result } = setup();
  fillAll(result, { email: " test@example.com ", name: " Test User " });

  act(() => result.current.onSubmit());

  expect(spies.mutate).toHaveBeenCalledWith(mocks.params);
  const breadcrumb = JSON.stringify(spies.addBreadcrumb.mock.calls[0]);
  expect(breadcrumb).toContain("User pressed create account");
  expect(breadcrumb).not.toContain("password123");
  expect(breadcrumb).not.toContain("test@example.com");
});

it("SHOULD refetch the user after a successful sign up", async () => {
  setup();

  await runFetch();

  expect(spies.execute).toHaveBeenCalledWith(mocks.params);
  expect(spies.update).toHaveBeenCalledTimes(1);
});

it("SHOULD show the email in use error", async () => {
  spies.execute.mockRejectedValueOnce(new EmailAlreadyInUseError());
  const { result } = setup();

  await runFetch();

  expect(result.current.formError).toBe("signup.errors.emailInUse");
  expect(spies.update).not.toHaveBeenCalled();
});

it("SHOULD show the network error", async () => {
  spies.execute.mockRejectedValueOnce(new ConnectivityError());
  const { result } = setup();

  await runFetch();

  expect(result.current.formError).toBe("auth.errors.network");
});

it("SHOULD send the user to login with the email prefilled WHEN the automatic login fails, without a form error", async () => {
  spies.execute.mockRejectedValueOnce(new AutoLoginFailedError());
  const { result } = setup();

  await runFetch();

  expect(spies.replace).toHaveBeenCalledWith({
    params: { autoLoginFailed: "1", email: "test@example.com" },
    pathname: "/login",
  });
  expect(result.current.formError).toBeUndefined();
});

it("SHOULD show the generic error and capture it WHEN something unexpected happens", async () => {
  const error = new GenericError();
  spies.execute.mockRejectedValueOnce(error);
  const { result } = setup();

  await runFetch();

  expect(result.current.formError).toBe("auth.errors.generic");
  expect(spies.captureException).toHaveBeenCalledWith(error);
});

it("SHOULD show the generic error WHEN the user refetch fails after sign up", async () => {
  spies.update.mockRejectedValueOnce(new Error("offline"));
  const { result } = setup();

  await runFetch();

  expect(result.current.formError).toBe("auth.errors.generic");
});

it("SHOULD show the network error WHEN the user refetch fails because the device is offline", async () => {
  spies.update.mockRejectedValueOnce(new ConnectivityError());
  const { result } = setup();

  await runFetch();

  expect(result.current.formError).toBe("auth.errors.network");
});

it("SHOULD clear each field error and the form error WHEN editing", async () => {
  spies.execute.mockRejectedValueOnce(new EmailAlreadyInUseError());
  const { result } = setup();
  act(() => result.current.onSubmit());
  await runFetch();

  act(() => result.current.onChangeName("a"));
  expect(result.current.nameError).toBeUndefined();
  expect(result.current.formError).toBeUndefined();
  act(() => result.current.onChangeEmail("a"));
  expect(result.current.emailError).toBeUndefined();
  act(() => result.current.onChangePassword("a"));
  expect(result.current.passwordError).toBeUndefined();
  act(() => result.current.onChangeConfirmPassword("a"));
  expect(result.current.confirmPasswordError).toBeUndefined();
});

it("SHOULD toggle the password visibility", () => {
  const { result } = setup();

  act(() => result.current.onTogglePassword());

  expect(result.current.showPassword).toBe(true);
});

it.each([
  ["onNameSubmit", "email"],
  ["onEmailSubmit", "password"],
  ["onPasswordSubmit", "confirmPassword"],
] as const)("SHOULD focus the next field WHEN %s runs", (handler, ref) => {
  const { result } = setup();
  const focus = jest.fn();
  (result.current.refs[ref] as { current: unknown }).current = { focus };

  act(() => result.current[handler]());

  expect(focus).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT throw WHEN refs are not attached", () => {
  const { result } = setup();

  expect(() => {
    act(() => {
      result.current.onNameSubmit();
      result.current.onEmailSubmit();
      result.current.onPasswordSubmit();
    });
  }).not.toThrow();
});

it("SHOULD go back to the login screen", () => {
  const { result } = setup();

  act(() => result.current.onGoToLogin());

  expect(spies.replace).toHaveBeenCalledWith("/login");
});

it("SHOULD mirror the logged state and ignore submit while a request is running", () => {
  spies.useUser.mockReturnValue({
    data: undefined,
    logged: true,
    update: spies.update,
  });
  spies.useMutation.mockReturnValue({
    data: undefined,
    error: null,
    isFetching: true,
    mutate: spies.mutate,
    status: "pending",
  } as never);
  const { result } = setup();
  fillAll(result);

  act(() => result.current.onSubmit());

  expect(result.current.logged).toBe(true);
  expect(result.current.isSubmitting).toBe(true);
  expect(spies.mutate).not.toHaveBeenCalled();
});
