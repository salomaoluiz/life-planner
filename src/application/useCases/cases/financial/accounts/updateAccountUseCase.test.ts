import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import updateAccountUseCase from "./updateAccountUseCase";

it("SHOULD update an account", async () => {
  const useCase = updateAccountUseCase(repositoriesMocks);
  await useCase.execute({ id: "acc-id", name: "Updated" });
  expect(
    repositoriesMocks.financialRepository.account.updateAccount,
  ).toHaveBeenCalled();
});
