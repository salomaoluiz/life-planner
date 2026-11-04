import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/hasCategoryTransactionsUseCase.mocks";

const hasSpy = spies.financialRepositoryTransaction.hasCategoryTransactions;

it.each([true, false])(
  "SHOULD answer %s as the repository does",
  async (answer) => {
    hasSpy.mockResolvedValueOnce(answer);

    expect(await setup()).toBe(answer);
    expect(hasSpy).toHaveBeenCalledWith(
      mocks.params.ownerIds,
      mocks.params.categoryId,
    );
  },
);

it("SHOULD re-throw a business error with the use case context", async () => {
  const error = new BusinessError();

  hasSpy.mockRejectedValueOnce(error);

  expect(await setupThrowable()).toBe(error);
  expect(error).toHaveProperty("context", {
    useCase: "financial.hasCategoryTransactionsUseCase",
  });
});

it("SHOULD re-throw unknown errors", async () => {
  hasSpy.mockRejectedValueOnce(new Error("boom"));

  expect(await setupThrowable()).toHaveProperty("message", "boom");
});
