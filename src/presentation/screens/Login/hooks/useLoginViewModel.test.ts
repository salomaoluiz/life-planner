import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  InvalidCredentialsError,
} from "@domain/entities/errors";

import {
  act,
  mocks,
  runFetch,
  setup,
  spies,
} from "./mocks/useLoginViewModel.mocks";

function fill(
  result: ReturnType<typeof setup>["result"],
  email: string,
  password: string,
) {
  act(() => {
    result.current.onChangeEmail(email);
    result.current.onChangePassword(password);
  });
}

it("SHOULD show the required errors and NOT send a request WHEN submitting empty fields", () => {
  const { result } = setup();

  act(() => result.current.onSubmit());

  expect(result.current.emailError).toBe("auth.validation.emailRequired");
  expect(result.current.passwordError).toBe("auth.validation.passwordRequired");
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD show the invalid email error and NOT send a request WHEN the email is malformed", () => {
  const { result } = setup();
  fill(result, "nope", "password123");

  act(() => result.current.onSubmit());

  expect(result.current.emailError).toBe("auth.validation.emailInvalid");
  expect(result.current.passwordError).toBeUndefined();
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD submit trimmed credentials and add a breadcrumb without field values", () => {
  const { result } = setup();
  fill(result, " test@example.com ", "password123");

  act(() => result.current.onSubmit());

  expect(spies.mutate).toHaveBeenCalledWith(mocks.params);
  expect(spies.addBreadcrumb).toHaveBeenCalledTimes(1);
  const breadcrumb = JSON.stringify(spies.addBreadcrumb.mock.calls[0]);
  expect(breadcrumb).toContain("User pressed sign in");
  expect(breadcrumb).not.toContain("password123");
  expect(breadcrumb).not.toContain("test@example.com");
});

it("SHOULD refetch the user after a successful login", async () => {
  setup();

  await runFetch(mocks.params);

  expect(spies.execute).toHaveBeenCalledWith(mocks.params);
  expect(spies.update).toHaveBeenCalledTimes(1);
});

it("SHOULD show the invalid credentials error and NOT refetch the user", async () => {
  spies.execute.mockRejectedValueOnce(new InvalidCredentialsError());
  const { result } = setup();

  await runFetch(mocks.params);

  expect(result.current.formError).toEqual({
    message: "login.errors.invalidCredentials",
    type: "error",
  });
  expect(spies.update).not.toHaveBeenCalled();
});

it("SHOULD show the network error and allow a retry", async () => {
  spies.execute.mockRejectedValueOnce(new ConnectivityError());
  const { result } = setup();
  fill(result, "test@example.com", "password123");

  await runFetch(mocks.params);
  expect(result.current.formError?.message).toBe("auth.errors.network");

  act(() => result.current.onSubmit());
  expect(spies.mutate).toHaveBeenCalledWith(mocks.params);
  expect(result.current.formError).toBeUndefined();
});

it("SHOULD show the generic error and capture the exception WHEN something unexpected happens", async () => {
  const error = new GenericError();
  spies.execute.mockRejectedValueOnce(error);
  const { result } = setup();

  await runFetch(mocks.params);

  expect(result.current.formError?.message).toBe("auth.errors.generic");
  expect(spies.captureException).toHaveBeenCalledTimes(1);
  expect(spies.captureException).toHaveBeenCalledWith(error);
});

it("SHOULD show the generic error and capture it WHEN the API rejects the validated input (400)", async () => {
  spies.execute.mockRejectedValueOnce(
    new ApiBusinessError("Validation Failed", 400),
  );
  const { result } = setup();

  await runFetch(mocks.params);

  expect(result.current.formError?.message).toBe("auth.errors.generic");
  expect(spies.captureException).toHaveBeenCalledTimes(1);
});

it("SHOULD show the generic error WHEN the user refetch fails after login", async () => {
  spies.update.mockRejectedValueOnce(new Error("offline"));
  const { result } = setup();

  await runFetch(mocks.params);

  expect(result.current.formError?.message).toBe("auth.errors.generic");
});

it("SHOULD show the network error WHEN the user refetch fails because the device is offline", async () => {
  spies.update.mockRejectedValueOnce(new ConnectivityError());
  const { result } = setup();

  await runFetch(mocks.params);

  expect(result.current.formError?.message).toBe("auth.errors.network");
  expect(spies.captureException).not.toHaveBeenCalled();
});

it("SHOULD show the generic error WHEN arriving from a signup whose automatic login failed", () => {
  spies.localSearchParams.mockReturnValue({
    autoLoginFailed: "1",
    email: "test@example.com",
  });

  const { result } = setup();

  expect(result.current.formError).toEqual({
    message: "auth.errors.generic",
    type: "error",
  });
  expect(result.current.email).toBe("test@example.com");
});

it("SHOULD clear field errors, the form error and the session notice WHEN the user edits a field", async () => {
  spies.execute.mockRejectedValueOnce(new InvalidCredentialsError());
  const { result } = setup();
  act(() => result.current.onSubmit());
  await runFetch(mocks.params);
  expect(result.current.formError).toBeDefined();
  expect(result.current.emailError).toBe("auth.validation.emailRequired");

  act(() => result.current.onChangeEmail("a"));
  expect(result.current.emailError).toBeUndefined();
  expect(result.current.formError).toBeUndefined();
  expect(spies.clearSessionExpiredNotice).toHaveBeenCalled();

  act(() => result.current.onChangePassword("b"));
  expect(result.current.passwordError).toBeUndefined();
});

it("SHOULD show the session expired notice WHEN the API client flagged an expired session", () => {
  spies.hasSessionExpiredNotice.mockReturnValue(true);

  const { result } = setup();

  expect(result.current.formError).toEqual({
    message: "login.errors.sessionExpired",
    type: "info",
  });
});

it("SHOULD NOT show a notice WHEN the session did not expire", () => {
  expect(setup().result.current.formError).toBeUndefined();
});

it("SHOULD prefill the email from the route params", () => {
  spies.localSearchParams.mockReturnValue({ email: "test@example.com" });

  expect(setup().result.current.email).toBe("test@example.com");
});

it("SHOULD toggle the password visibility", () => {
  const { result } = setup();
  expect(result.current.showPassword).toBe(false);

  act(() => result.current.onTogglePassword());

  expect(result.current.showPassword).toBe(true);
});

it("SHOULD focus the password field WHEN submitting the email field", () => {
  const { result } = setup();
  const focus = jest.fn();
  (result.current.passwordRef as { current: unknown }).current = { focus };

  act(() => result.current.onEmailSubmit());

  expect(focus).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT focus anything WHEN the password ref is not attached", () => {
  const { result } = setup();

  expect(() => act(() => result.current.onEmailSubmit())).not.toThrow();
});

it("SHOULD go to the sign up screen", () => {
  const { result } = setup();

  act(() => result.current.onGoToSignUp());

  expect(spies.push).toHaveBeenCalledWith("/signup");
});

it("SHOULD mirror the logged state of the user provider", () => {
  spies.useUser.mockReturnValue({
    data: undefined,
    logged: true,
    update: spies.update,
  });

  expect(setup().result.current.logged).toBe(true);
});

it("SHOULD ignore submit WHEN a request is already running", () => {
  spies.useMutation.mockReturnValue({
    data: undefined,
    error: null,
    isFetching: true,
    mutate: spies.mutate,
    status: "pending",
  } as never);
  const { result } = setup();
  fill(result, "test@example.com", "password123");

  act(() => result.current.onSubmit());

  expect(spies.mutate).not.toHaveBeenCalled();
  expect(result.current.isSubmitting).toBe(true);
});
