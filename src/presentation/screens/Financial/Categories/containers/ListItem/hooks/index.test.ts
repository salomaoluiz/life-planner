import { CategoryHasTransactions } from "@domain/entities/errors";

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

it("SHOULD delete immediately WITHOUT a prompt WHEN the category has no subcategories", async () => {
  const { mutate, result } = setup();

  await result.current.onDelete();

  expect(spies.alert).not.toHaveBeenCalled();
  expect(spies.confirm).not.toHaveBeenCalled();
  expect(mutate).toHaveBeenCalledWith({ id: "cat-1", ownerId: "owner-1" });
});

describe("WHEN the category has subcategories", () => {
  it("SHOULD ask on native with the subcategories warning AND delete only after the destructive button", async () => {
    const { mutate, result } = setup("idle", { subcategories: true });

    await result.current.onDelete();

    expect(mutate).not.toHaveBeenCalled();
    const [title, message, buttons] = spies.alert.mock.calls[0];
    expect(title).toBe("financial.categories.deleteAlertTitle");
    expect(message).toBe(
      "financial.categories.deleteAlertMsg financial.categories.deleteConfirm.withSubcategories",
    );
    expect(buttons?.map((button) => button.text)).toEqual([
      "financial.categories.cancel",
      "financial.categories.deleteBtn",
    ]);

    buttons?.[1].onPress?.();

    expect(mutate).toHaveBeenCalledWith({ id: "cat-1", ownerId: "owner-1" });
  });

  it("SHOULD NOT delete WHEN the native prompt is cancelled", async () => {
    const { mutate, result } = setup("idle", { subcategories: true });

    await result.current.onDelete();
    const [, , buttons] = spies.alert.mock.calls[0];
    buttons?.[0].onPress?.();

    expect(mutate).not.toHaveBeenCalled();
  });

  it.each([
    [true, 1],
    [false, 0],
  ])(
    "SHOULD use window.confirm on web (confirmed: %s)",
    async (confirmed, calls) => {
      spies.confirm.mockReturnValue(confirmed);
      const { mutate, result } = setup("idle", {
        subcategories: true,
        web: true,
      });

      await result.current.onDelete();

      expect(spies.alert).not.toHaveBeenCalled();
      expect(spies.confirm).toHaveBeenCalledTimes(1);
      expect(mutate).toHaveBeenCalledTimes(calls);
    },
  );
});

it("SHOULD hand the delete mutation error to the financial error feedback AND not refetch", () => {
  const error = new CategoryHasTransactions();

  setup("error", { error });

  expect(spies.feedback).toHaveBeenCalledWith(error);
  expect(mocks.refetch).not.toHaveBeenCalled();
});
