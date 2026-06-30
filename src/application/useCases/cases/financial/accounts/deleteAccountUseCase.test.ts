import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import deleteAccountUseCase from "./deleteAccountUseCase";

it("SHOULD delete an account", async () => {
  const useCase = deleteAccountUseCase(repositoriesMocks);
  await useCase.execute({ id: "acc-id", ownerId: "user-id" });
  expect(
    repositoriesMocks.financialRepository.account.deleteAccount,
  ).toHaveBeenCalled();
});
