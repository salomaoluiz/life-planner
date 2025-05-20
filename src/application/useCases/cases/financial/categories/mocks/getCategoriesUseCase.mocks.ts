import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import CategoryEntityFixture from "@domain/entities/financial/mocks/CategoryEntity.fixture";

import getCategoriesUseCase, {
  GetCategoriesUseCaseParams,
} from "../getCategoriesUseCase";

// region mocks
const defaultParams: GetCategoriesUseCaseParams = {
  ownerIds: [
    "a02fc555-758a-419b-bfa9-b27799db926d",
    "e3ff764d-c31f-4739-8f25-9f31ab8b7a8b",
  ],
};

const categoryEntityFixture = new CategoryEntityFixture().withDefault();

const categoryEntitiesMock = [
  categoryEntityFixture.withId("7725d480-faff-4139-a62b-b69c3702aed2").build(),
  categoryEntityFixture.withId("7725d480-faff-4139-a62b-b69c3702aed2").build(),
];

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<GetCategoriesUseCaseParams>) {
  return getCategoriesUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<GetCategoriesUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.categories,
  ),
};

const mocks = {
  categoryEntities: categoryEntitiesMock,
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
