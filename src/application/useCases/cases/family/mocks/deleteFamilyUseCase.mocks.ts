import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteFamilyUseCase, {
  DeleteFamilyUseCaseParams,
} from "../deleteFamilyUseCase";

// region mocks

const defaultParams: DeleteFamilyUseCaseParams = {
  id: "b55b41b2-0da5-48d9-bd12-fceda8ad1b22",
};
const unknownError = new Error("Unknown Error");
const businessError = new BusinessError();

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<DeleteFamilyUseCaseParams>) {
  return deleteFamilyUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function throwableSetup() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}
const spies = {
  familyRepository: jest.mocked(repositoriesMocks.familyRepository),
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
