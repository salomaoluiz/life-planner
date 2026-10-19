import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import DailyBalanceEntity from "@domain/entities/financial/DailyBalanceEntity";

import getDailyBalancesUseCase from "./getDailyBalancesUseCase";

function repository() {
  return jest.mocked(
    repositoriesMocks.financialRepository.account.getDailyBalances,
  );
}

it("SHOULD return the DTO of the entity AND pass the params", async () => {
  const entity = new DailyBalanceEntity({
    accounts: [],
    days: [],
    month: "2026-11",
  });
  repository().mockResolvedValueOnce(entity);
  const params = { month: "2026-11", ownerIds: ["u1"] };

  const result =
    await getDailyBalancesUseCase(repositoriesMocks).execute(params);

  expect(repository()).toHaveBeenCalledWith(params);
  expect(result.month).toBe("2026-11");
});

it("SHOULD add the use case context to a DefaultError AND rethrow", async () => {
  const error = new BusinessError();
  const spy = jest.spyOn(error, "addContext");
  repository().mockRejectedValueOnce(error);

  await expect(
    getDailyBalancesUseCase(repositoriesMocks).execute({
      month: "2026-11",
      ownerIds: [],
    }),
  ).rejects.toBe(error);
  expect(spy).toHaveBeenCalledWith({
    useCase: "financial.getDailyBalancesUseCase",
  });
});
