import { AccountHasTransactions } from "@domain/entities/errors";

import { act, mocks, setup, spies } from "./mocks/index.mocks";

const deleteParams = { id: "acc-1", ownerId: "owner-1" };

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["delete_account"],
    fetch: mocks.useCases.deleteFinancialAccountUseCase.execute,
  });
});

it("SHOULD refetch WHEN the delete succeeded", () => {
  setup({ status: "success" });

  expect(mocks.refetch).toHaveBeenCalledTimes(1);
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT refetch WHEN the delete status is %s",
  (status) => {
    setup({ status });

    expect(mocks.refetch).not.toHaveBeenCalled();
  },
);

describe("onDelete on web", () => {
  it("SHOULD NOT delete WHEN the confirmation is rejected", () => {
    const { mutate, result } = setup({ web: true });
    spies.confirm.mockReturnValueOnce(false);

    act(() => result.current.onDelete());

    expect(spies.confirm).toHaveBeenCalledWith(
      "financial.accounts.deleteAlertTitle\n\nfinancial.accounts.deleteAlertMsg",
    );
    expect(mutate).not.toHaveBeenCalled();
    expect(spies.alert).not.toHaveBeenCalled();
  });

  it("SHOULD delete the account WHEN the confirmation is accepted", () => {
    const { mutate, result } = setup({ web: true });
    spies.confirm.mockReturnValueOnce(true);

    act(() => result.current.onDelete());

    expect(mutate).toHaveBeenCalledWith(deleteParams);
  });
});

describe("onDelete on native", () => {
  function pressedButtons() {
    return spies.alert.mock.calls[0][2]!;
  }

  it("SHOULD show an alert with cancel and delete buttons", () => {
    const { result } = setup();

    act(() => result.current.onDelete());

    expect(spies.alert).toHaveBeenCalledWith(
      "financial.accounts.deleteAlertTitle",
      "financial.accounts.deleteAlertMsg",
      [
        { style: "cancel", text: "financial.accounts.cancel" },
        {
          onPress: expect.any(Function),
          style: "destructive",
          text: "financial.accounts.deleteBtn",
        },
      ],
    );
  });

  it("SHOULD NOT delete WHEN the alert is only shown or cancelled", () => {
    const { mutate, result } = setup();

    act(() => result.current.onDelete());

    expect(pressedButtons()[0].onPress).toBeUndefined();
    expect(mutate).not.toHaveBeenCalled();
  });

  it("SHOULD delete the account WHEN the destructive button is pressed", () => {
    const { mutate, result } = setup();
    act(() => result.current.onDelete());

    act(() => pressedButtons()[1].onPress!());

    expect(mutate).toHaveBeenCalledWith(deleteParams);
  });
});

it("SHOULD open the edit modal with the account values as strings WHEN onEdit is called", () => {
  const { result } = setup();

  act(() => result.current.onEdit());

  expect(spies.push).toHaveBeenCalledWith({
    params: {
      balance: "1500.5",
      icon: "bank",
      id: "acc-1",
      name: "Checking",
      ownerId: "owner-1",
      status: "ACTIVE",
    },
    pathname: "/financial/account/add_new_account",
  });
});

it("SHOULD hand the delete mutation error to the financial error feedback", () => {
  const error = new AccountHasTransactions();

  setup({ error, status: "error" });

  expect(spies.feedback).toHaveBeenCalledWith(error);
});

it("SHOULD NOT refetch WHEN the delete failed (the account stays in the list)", () => {
  setup({ error: new AccountHasTransactions(), status: "error" });

  expect(mocks.refetch).not.toHaveBeenCalled();
});
