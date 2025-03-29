import { datasourcesMocks } from "@data/datasource/mocks";
import { CreateFamilyRepositoryParams } from "@domain/repositories/family";
import cache from "@infrastructure/cache";

import transactionRepositoryImpl from "../transactionRepositoryImpl";

// region mocks
const defaultProps = {
  name: "Family Name",
  ownerId: "123",
} as CreateFamilyRepositoryParams;

const createFamilySuccessMock = {
  id: "123",
  name: "Family Name",
  ownerId: "123",
};
// endregion mocks

// region spies

const createFamilySpy = jest.spyOn(
  datasourcesMocks.familyDatasource,
  "createFamily",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<CreateFamilyRepositoryParams>) {
  return transactionRepositoryImpl(datasourcesMocks).createFamily({
    ...defaultProps,
    ...props,
  });
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  createFamily: createFamilySpy,
};

const mocks = {
  createFamilySuccessMock,
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
