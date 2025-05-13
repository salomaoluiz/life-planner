import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import FamilyModel from "@data/models/family/FamilyModel";
import cache from "@infrastructure/cache";

import createFamily, { Params } from "../createFamily";

// region mocks
const defaultParams: Params = {
  name: "Family Name",
  ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
};

const familyModelMock = new FamilyModel({
  id: "1dcc732e-8886-4a68-b669-ded3f3809c20",
  name: defaultParams.name,
  ownerId: defaultParams.ownerId,
});

// endregion mocks

// region spies
const familyDatasourceSpy = jest.mocked(datasourcesMocks.familyDatasource);
familyDatasourceSpy.createFamily.mockResolvedValue(familyModelMock);

const invalidateCacheSpy = jest.spyOn(cache, "invalidate");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<Params>) {
  return createFamily({ ...defaultParams, ...params }, datasourcesMocks);
}

const spies = {
  cache: {
    invalidate: invalidateCacheSpy,
  },
  familyDatasource: familyDatasourceSpy,
};

const mocks = {
  defaultParams,
  familyModel: familyModelMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
