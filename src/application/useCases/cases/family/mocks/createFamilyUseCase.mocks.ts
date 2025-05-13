import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import FamilyEntityFixture from "@domain/entities/family/mocks/FamilyEntity.fixture";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";
import * as crypto from "@infrastructure/crypto";

import createFamilyUseCase, {
  CreateFamilyUseCaseParams,
} from "../createFamilyUseCase";

// region mocks
const userEntityMock = new UserEntityFixture().withDefault().build();
const familyEntityMock = new FamilyEntityFixture().withDefault().build();

const unknownError = new Error("Unknown Error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

const defaultParams: CreateFamilyUseCaseParams = {
  name: "New Family",
};

const encodeResult = "encodedToken";

// endregion mocks

// region spies

const encodeSpy = jest.spyOn(crypto, "encode");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<CreateFamilyUseCaseParams>) {
  return createFamilyUseCase(repositoriesMocks).execute({
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
  encode: encodeSpy,
  familyMemberRepository: jest.mocked(repositoriesMocks.familyMemberRepository),
  familyRepository: jest.mocked(repositoriesMocks.familyRepository),
  userRepository: jest.mocked(repositoriesMocks.userRepository),
};

const mocks = {
  defaultParams,
  encodeResult,
  error: {
    business: businessError,
    unknown: unknownError,
  },
  familyEntity: familyEntityMock,
  userEntity: userEntityMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
