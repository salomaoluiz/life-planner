import { datasourcesMocks } from "@data/datasource/mocks";
import { UpdateFamilyRepositoryParams } from "@domain/repositories/family";
import cache from "@infrastructure/cache";

import familyRepositoryImpl from "../familyRepositoryImpl";

// region mocks
const defaultProps = {
  id: "123",
  name: "Family Name",
} as UpdateFamilyRepositoryParams;

const updateFamilySuccessMock = {
  id: "123",
  name: "Family Name",
  ownerId: "123",
};
// endregion mocks

// region spies

const updateFamilySpy = jest.spyOn(
  datasourcesMocks.familyDatasource,
  "updateFamily",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<UpdateFamilyRepositoryParams>) {
  return familyRepositoryImpl(datasourcesMocks).updateFamily({
    ...defaultProps,
    ...props,
  });
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  updateFamily: updateFamilySpy,
};

const mocks = {
  defaultProps,
  updateFamilySuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
