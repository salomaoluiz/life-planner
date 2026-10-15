import {
  AccountEmailMismatchError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import {
  act,
  captured,
  mocks,
  runFetch,
  setup,
  spies,
} from "./mocks/useDeleteAccountViewModel.mocks";

function openEmailStep(result: ReturnType<typeof setup>["result"]) {
  act(() => result.current.onPress());
  act(() => result.current.onContinue());
}

it("SHOULD walk closed → confirm → email", () => {
  const { result } = setup();
  expect(result.current.step).toBe("closed");

  act(() => result.current.onPress());
  expect(result.current.step).toBe("confirm");

  act(() => result.current.onContinue());
  expect(result.current.step).toBe("email");
});

it("SHOULD close WITHOUT sending a request WHEN cancelling either dialog, AND not reopen dialog 1", () => {
  const { result } = setup();

  act(() => result.current.onPress());
  act(() => result.current.onCancel());
  expect(result.current.step).toBe("closed");

  openEmailStep(result);
  act(() => result.current.onChangeEmail("typed@example.com"));
  act(() => result.current.onCancel());

  expect(result.current.step).toBe("closed");
  expect(result.current.email).toBe("");
  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD list only the families the user OWNS", () => {
  expect(setup().result.current.ownedFamilies).toBe("Mine, Also mine");
});

it("SHOULD return no families text WHEN the user owns none or the list is empty", () => {
  spies.useQuery.mockReturnValue({ data: [mocks.families[1]] } as never);
  expect(setup().result.current.ownedFamilies).toBe("");

  spies.useQuery.mockReturnValue({ data: undefined } as never);
  expect(setup().result.current.ownedFamilies).toBe("");
});

it("SHOULD fall back to no families WHEN the families lookup fails (deleting must stay possible)", async () => {
  setup();
  spies.familiesExecute.mockRejectedValueOnce(new GenericError());

  expect(await captured.familiesFetch?.()).toEqual([]);
});

it("SHOULD expose the families loading state for dialog 1", () => {
  spies.useQuery.mockReturnValue({ data: [], isFetching: true } as never);

  expect(setup().result.current.isLoadingFamilies).toBe(true);
});

it.each([
  ["", false],
  ["other@example.com", false],
  ["test@example.com", true],
  ["TEST@example.com", true],
  ["  test@example.com  ", true],
])("SHOULD compute canSubmit for %p → %p", (typed, expected) => {
  const { result } = setup();
  openEmailStep(result);

  act(() => result.current.onChangeEmail(typed));

  expect(result.current.canSubmit).toBe(expected);
});

it("SHOULD NOT allow submitting WHEN the profile is not loaded", () => {
  spies.useUser.mockReturnValue({ data: undefined } as never);
  const { result } = setup();

  act(() => result.current.onChangeEmail(""));

  expect(result.current.canSubmit).toBe(false);
});

it("SHOULD ignore submit WHEN the email does not match", () => {
  const { result } = setup();
  act(() => result.current.onChangeEmail("other@example.com"));

  act(() => result.current.onSubmit());

  expect(spies.mutate).not.toHaveBeenCalled();
});

it("SHOULD send the trimmed typed email once WHEN it matches", () => {
  const { result } = setup();
  act(() => result.current.onChangeEmail("  Test@example.com "));

  act(() => result.current.onSubmit());

  expect(spies.mutate).toHaveBeenCalledTimes(1);
  expect(spies.mutate).toHaveBeenCalledWith("Test@example.com");
});

it("SHOULD ignore submit AND cancel WHILE deleting (double submit, backdrop, Esc)", () => {
  mocks.state.isFetching = true;
  const { result } = setup();
  openEmailStep(result);
  act(() => result.current.onChangeEmail("test@example.com"));

  act(() => result.current.onSubmit());
  act(() => result.current.onCancel());

  expect(spies.mutate).not.toHaveBeenCalled();
  expect(result.current.step).toBe("email");
  expect(result.current.isDeleting).toBe(true);
});

it("SHOULD resolve { deleted: true } WHEN the use case succeeds", async () => {
  setup();

  expect(await runFetch("test@example.com")).toEqual({ deleted: true });
  expect(spies.deleteExecute).toHaveBeenCalledWith({
    email: "test@example.com",
  });
});

it("SHOULD show the field error AND keep the email WHEN the server says it does not match", async () => {
  const { result } = setup();
  act(() => result.current.onChangeEmail("test@example.com"));
  spies.deleteExecute.mockRejectedValueOnce(new AccountEmailMismatchError());

  expect(await runFetch("test@example.com")).toEqual({ deleted: false });

  expect(result.current.mismatch).toBe(true);
  expect(result.current.email).toBe("test@example.com");
  expect(spies.captureException).not.toHaveBeenCalled();
});

it.each([new ConnectivityError(), new GenericError()])(
  "SHOULD show the inline error, report it AND allow a retry WHEN the request fails with %p",
  async (error) => {
    const { result } = setup();
    act(() => result.current.onChangeEmail("test@example.com"));
    spies.deleteExecute.mockRejectedValueOnce(error);

    await runFetch("test@example.com");

    expect(result.current.hasError).toBe(true);
    expect(result.current.email).toBe("test@example.com");
    expect(spies.captureException).toHaveBeenCalledWith(error);

    act(() => result.current.onSubmit());
    expect(result.current.hasError).toBe(false);
    expect(spies.mutate).toHaveBeenCalledTimes(1);
  },
);

it("SHOULD show no error WHEN the session expired (401: the session flow redirects)", async () => {
  const { result } = setup();
  spies.deleteExecute.mockRejectedValueOnce(new UserNotLoggedError());

  expect(await runFetch("test@example.com")).toEqual({ deleted: false });

  expect(result.current.hasError).toBe(false);
  expect(result.current.mismatch).toBe(false);
  expect(spies.captureException).not.toHaveBeenCalled();
});

it("SHOULD clear the errors WHEN the user types again", async () => {
  const { result } = setup();
  spies.deleteExecute.mockRejectedValueOnce(new AccountEmailMismatchError());
  await runFetch("x");

  act(() => result.current.onChangeEmail("a"));

  expect(result.current.mismatch).toBe(false);
  expect(result.current.hasError).toBe(false);
});

it("SHOULD clean the session, set the notice AND go to login WHEN the deletion succeeded", () => {
  const order: string[] = [];
  spies.clearSessionExpiredNotice.mockImplementation(() => {
    order.push("clearExpired");
  });
  spies.setAccountDeletedNotice.mockImplementation(() => {
    order.push("setDeleted");
  });
  spies.replace.mockImplementation(() => {
    order.push("replace");
  });
  spies.resetFetcherData.mockImplementation(async () => {
    order.push("reset");
  });
  Object.assign(mocks.state, { data: { deleted: true }, status: "success" });

  setup();

  expect(spies.replace).toHaveBeenCalledWith("/login");
  expect(order).toEqual(["clearExpired", "setDeleted", "replace", "reset"]);
});

it("SHOULD NOT clean up or navigate WHEN the mutation resolved with deleted false, and close the sheets", () => {
  Object.assign(mocks.state, { data: { deleted: false }, status: "success" });

  const { result } = setup();

  expect(spies.replace).not.toHaveBeenCalled();
  expect(spies.setAccountDeletedNotice).not.toHaveBeenCalled();
  expect(result.current.step).toBe("closed");
});

it("SHOULD NOT navigate WHEN the mutation is idle", () => {
  setup();

  expect(spies.replace).not.toHaveBeenCalled();
  expect(spies.resetFetcherData).not.toHaveBeenCalled();
});
