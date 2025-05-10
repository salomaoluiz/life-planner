import { repositoriesMocks } from "@data/repositories/mocks";
import { BusinessError } from "@domain/entities/errors";
import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";

import getStockItemsUseCase, {
  GetStockItemsUseCaseParams,
} from "../getStockItemsUseCase";

// region mocks
const defaultParams: GetStockItemsUseCaseParams = {
  ownerIds: [
    "8ed7b05f-c1d7-45d9-b926-8df17ccfb626",
    "c5d99852-7fb9-4f44-9aa9-4f1c65a40b5a",
  ],
};

const stockEntityFixture = new StockEntityFixture().withDefault();

const stockItemsMock = [
  stockEntityFixture
    .withId("dd57b594-e15b-471e-a4cc-0cc27dcfcaaf")
    .withOwnerId(defaultParams.ownerIds[0])
    .build(),
  stockEntityFixture
    .withId("bfa64317-6078-41ce-b07b-751407c5e376")
    .withOwnerId(defaultParams.ownerIds[1])
    .build(),
];

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

// endregion mocks

// region spies
const stockRepositorySpy = jest.mocked(repositoriesMocks.stockRepository);

async function findOwnerStockItem(id: string) {
  const stockItem = stockItemsMock.find((item) => item.ownerId === id);
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

async function setup(params?: Partial<GetStockItemsUseCaseParams>) {
  return getStockItemsUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<GetStockItemsUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  stockRepository: stockRepositorySpy,
};

const mocks = {
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  stockItems: stockItemsMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
