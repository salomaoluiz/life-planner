import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import createAccountUseCase from "./createAccountUseCase";

it("SHOULD create an account", async () => {
  const useCase = createAccountUseCase(repositoriesMocks);
  await useCase.execute({
    balance: 100,
    icon: "icon",
    name: "Acc",
    owner: "USER",
    ownerId: "user-id",
    status: "ACTIVE",
  });

  expect(
    repositoriesMocks.financialRepository.account.createAccount,
  ).toHaveBeenCalled();
});
