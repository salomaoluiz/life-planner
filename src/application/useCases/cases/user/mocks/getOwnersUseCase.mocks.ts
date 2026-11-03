import getOwnersUseCase from "@application/useCases/cases/user/getOwnersUseCase";
import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

// region mocks
const ownersMock = [
  new OwnerEntity({
    name: "Family A",
    ownerId: "e53c1398-3572-4fe9-8cda-4fea303d9c5f",
    type: OwnerType.FAMILY,
  }),
  new OwnerEntity({
    archived: true,
    name: "Family B",
    ownerId: "4afbc5d5-40e7-40f7-b8e5-812a5c326aea",
    type: OwnerType.FAMILY,
  }),
  new OwnerEntity({
    name: "Test User",
    ownerId: "05ff9a60-a7a4-44f7-a1d6-d82ce68fc9b6",
    type: OwnerType.USER,
  }),
];

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any context",
});

// endregion mocks

// region spies
const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);
const familyRepositorySpy = jest.mocked(repositoriesMocks.familyRepository);

userRepositorySpy.getOwners.mockResolvedValue(ownersMock);
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getOwnersUseCase(repositoriesMocks).execute();
}

async function setupThrowable() {
  try {
    await setup();
  } catch (err) {
    return err;
  }
}

const spies = {
  familyRepository: familyRepositorySpy,
  userRepository: userRepositorySpy,
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  owners: ownersMock,
};

export { mocks, setup, setupThrowable, spies };
