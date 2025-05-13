import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";

import deleteStockItemUseCase, {
  DeleteStockItemUseCaseParams,
} from "../deleteStockItemUseCase";

// region mocks
const defaultParams: DeleteStockItemUseCaseParams = {
  id: "cbd230e5-40da-4e4b-879d-871aadb60840",
  ownerId: "958c2417-62eb-46bf-9341-57ff8050bc05",
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

async function setup(params?: Partial<DeleteStockItemUseCaseParams>) {
  return deleteStockItemUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<DeleteStockItemUseCaseParams>) {
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
