import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import FamilyEntityFixture from "@domain/entities/family/mocks/FamilyEntity.fixture";
import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";
import UserEntityFixture from "@domain/entities/user/mocks/UserEntity.fixture";

import getStockDashboardUseCase from "../getStockDashboardUseCase";

// region mocks

const userEntity = new UserEntityFixture().withDefault().build();
const familyEntityFixture = new FamilyEntityFixture().withDefault();
const stockEntityFixture = new StockEntityFixture().withDefault();

const familiesMock = [
  familyEntityFixture.withId("02614b7d-d6d7-4f4f-98e9-23c193bd539c").build(),
  familyEntityFixture.withId("f3a2b0d4-5c7e-4b8e-8f1c-6a9d1f2b3c4d").build(),
];

const stockItemsMock = [
  stockEntityFixture
    .withId("a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6")
    .withOwnerId(familiesMock[0].id)
    .build(),
  stockEntityFixture
    .withId("q1r2s3t4-u5v6-w7x8-y9z0-a1b2c3d4e5f6")
    .withOwnerId(familiesMock[1].id)
    .build(),
  stockEntityFixture
    .withId("f7g8h9i0-j1k2-l3m4-n5o6-p7q8r9s0t1u2")
    .withOwnerId(userEntity.id)
    .build(),
];

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

// endregion mocks

// region spies
const familyRepositorySpy = jest.mocked(repositoriesMocks.familyRepository);
const stockRepositorySpy = jest.mocked(repositoriesMocks.stockRepository);
const userRepositorySpy = jest.mocked(repositoriesMocks.userRepository);

userRepositorySpy.getUser.mockResolvedValue(userEntity);
familyRepositorySpy.getFamilies.mockResolvedValue(familiesMock);

async function findOwnerStockItem(ownerId: string) {
  const stockItem = stockItemsMock.find((item) => item.ownerId === ownerId);
  if (!stockItem) {
    return Promise.resolve([]);
  }
  return Promise.resolve([stockItem]);
}
stockRepositorySpy.getStockItems.mockImplementation(findOwnerStockItem);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return getStockDashboardUseCase(repositoriesMocks).execute();
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
  stockRepository: stockRepositorySpy,
  userRepository: userRepositorySpy,
};

const mocks = {
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  families: familiesMock,
  stockItems: stockItemsMock,
  user: userEntity,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
