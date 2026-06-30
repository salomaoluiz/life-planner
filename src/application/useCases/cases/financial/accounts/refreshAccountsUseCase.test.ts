import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import refreshAccountsUseCase from "./refreshAccountsUseCase";

it("SHOULD refresh accounts", async () => {
  const useCase = refreshAccountsUseCase(repositoriesMocks);
  await useCase.execute();
  expect(repositoriesMocks.cacheRepository.invalidate).toHaveBeenCalled();
});
