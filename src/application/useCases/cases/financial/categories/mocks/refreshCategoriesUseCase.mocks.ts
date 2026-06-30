import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";

import refreshCategoriesUseCase from "../refreshCategoriesUseCase";

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return refreshCategoriesUseCase(repositoriesMocks).execute();
}

const spies = {
  cacheRepository: jest.mocked(repositoriesMocks.cacheRepository),
};

export { setup, spies };
