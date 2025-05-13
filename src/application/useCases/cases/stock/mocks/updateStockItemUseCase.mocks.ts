import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import updateStockItemUseCase, {
  UpdateStockItemUseCaseParams,
} from "../updateStockItemUseCase";

// region mocks
const defaultParams: UpdateStockItemUseCaseParams = {
  barcode: "1234567890123",
  brand: "Some brand",
  description: "Some description",
  expirationDate: new Date("2023-12-31"),
  id: "1234567890123",
  notes: "Some notes",
  openingDate: new Date("2023-01-01"),
  owner: "FAMILY",
  ownerId: "1234567890123",
  purchaseDate: new Date("2023-01-01"),
  quantity: 1,
  unit: "unit",
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

async function setup(params?: Partial<UpdateStockItemUseCaseParams>) {
  return updateStockItemUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<UpdateStockItemUseCaseParams>) {
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
