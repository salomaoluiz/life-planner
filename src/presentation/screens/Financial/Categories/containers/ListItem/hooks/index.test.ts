import { mocks, setup, spies } from "./mocks/index.mocks";

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["delete_category"],
    fetch: mocks.useCases.deleteFinancialCategoryUseCase.execute,
  });
});

it("SHOULD mutate with the category and owner ids WHEN onDelete is called", async () => {
  const { mutate, result } = setup();

  await result.current.onDelete();

  expect(mutate).toHaveBeenCalledWith({ id: "cat-1", ownerId: "owner-1" });
});

it("SHOULD refetch WHEN the delete succeeded", () => {
  setup("success");

  expect(mocks.refetch).toHaveBeenCalledTimes(1);
});

it.each(["idle", "error"] as const)(
  "SHOULD NOT refetch WHEN the delete status is %s",
  (status) => {
    setup(status);

    expect(mocks.refetch).not.toHaveBeenCalled();
  },
);
