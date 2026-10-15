import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import adjustAccountBalanceUseCase from "./adjustAccountBalanceUseCase";

function repository() {
  return jest.mocked(
    repositoriesMocks.financialRepository.account.adjustAccountBalance,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD ask the repository to make the balance the desired value", async () => {
  await adjustAccountBalanceUseCase(repositoriesMocks).execute({
    balance: 1200.5,
    id: "acc-id",
  });

  expect(repository()).toHaveBeenCalledWith({ balance: 1200.5, id: "acc-id" });
});

it("SHOULD add the use case context and rethrow WHEN the repository throws a DefaultError", async () => {
  const error = new BusinessError();
  repository().mockRejectedValueOnce(error);

  await expect(
    adjustAccountBalanceUseCase(repositoriesMocks).execute({
      balance: 1,
      id: "acc-id",
    }),
  ).rejects.toBe(error);
  expect(error).toHaveProperty("context", {
    useCase: "financial.adjustAccountBalanceUseCase",
  });
});

it("SHOULD rethrow unknown errors untouched", async () => {
  const error = new Error("boom");
  repository().mockRejectedValueOnce(error);

  await expect(
    adjustAccountBalanceUseCase(repositoriesMocks).execute({
      balance: 1,
      id: "acc-id",
    }),
  ).rejects.toBe(error);
});

it("SHOULD expose its unique name", () => {
  expect(adjustAccountBalanceUseCase(repositoriesMocks).uniqueName).toBe(
    "financial.adjust_account_balance_use_case",
  );
});
