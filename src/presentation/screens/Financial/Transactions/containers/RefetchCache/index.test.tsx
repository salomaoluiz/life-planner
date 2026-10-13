import { fireEvent, mocks, screen, setup, spies } from "./mocks/index.mocks";

it("SHOULD configure the refresh mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["refresh_transactions"],
    fetch: mocks.useCases.refreshFinancialTransactionsUseCase.execute,
  });
});

it("SHOULD trigger the refresh mutation WHEN the refresh button is pressed", () => {
  const { mutate } = setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.tryAgain")[0]);

  expect(mutate).toHaveBeenCalledTimes(1);
});

it("SHOULD refetch the query WHEN the refresh succeeded", () => {
  setup("success");

  expect(mocks.refetchQuery).toHaveBeenCalledTimes(1);
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT refetch the query WHEN the status is %s",
  (status) => {
    setup(status);

    expect(mocks.refetchQuery).not.toHaveBeenCalled();
  },
);
