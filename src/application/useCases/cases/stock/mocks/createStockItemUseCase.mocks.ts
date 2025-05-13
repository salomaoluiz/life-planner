import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import createStockItemUseCase, {
  CreateStockItemUseCaseParams,
} from "../createStockItemUseCase";

// region mocks
const defaultParams: CreateStockItemUseCaseParams = {
  barcode: "1234567890123",
  brand: "Brand",
  description: "Description",
  expirationDate: new Date(2025, 4, 20),
  notes: "Notes",
  openingDate: new Date(2025, 4, 10),
  owner: "FAMILY",
  ownerId: "02614b7d-d6d7-4f4f-98e9-23c193bd539c",
  purchaseDate: new Date(2025, 4, 5),
  quantity: 1,
  unit: "UNIT",
};

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

async function setup(params?: Partial<CreateStockItemUseCaseParams>) {
  return createStockItemUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<CreateStockItemUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  stockRepository: jest.mocked(repositoriesMocks.stockRepository),
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

export { mocks, setup, setupThrowable, spies };
