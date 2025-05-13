import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateFamilyUseCase, {
  UpdateFamilyUseCaseParams,
} from "../updateFamilyUseCase";

// region mocks
const defaultParams = {
  id: "552ad817-ecd8-4c2e-bb74-00a20bc786ec",
  name: "New Family",
};

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<UpdateFamilyUseCaseParams>) {
  return updateFamilyUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function throwableSetup(params?: Partial<UpdateFamilyUseCaseParams>) {
  try {
    await setup(params);
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
