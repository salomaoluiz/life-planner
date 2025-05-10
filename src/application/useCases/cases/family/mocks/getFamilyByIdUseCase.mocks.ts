import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import FamilyEntityFixture from "@domain/entities/family/mocks/FamilyEntity.fixture";

import getFamilyByIdUseCase, {
  GetFamilyByIdUseCaseParams,
} from "../getFamilyByIdUseCase";

// region mocks
const familyEntity = new FamilyEntityFixture().withDefault().build();

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_context",
});

const defaultParams: GetFamilyByIdUseCaseParams = {
  familyId: familyEntity.id,
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<GetFamilyByIdUseCaseParams>) {
  return getFamilyByIdUseCase(repositoriesMocks).execute({
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
  familyEntity,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
