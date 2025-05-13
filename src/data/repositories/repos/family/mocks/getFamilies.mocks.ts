import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import FamilyModel from "@data/models/family/FamilyModel";
import cache from "@infrastructure/cache";

import getFamilies, { Params } from "../getFamilies";

// region mocks
const defaultParams: Params = "fab7eed4-8b42-44c5-ad57-c2152e35d8cf";
const firstFamily = new FamilyModel({
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  name: "First Family",
  ownerId: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
});

const secondFamily = new FamilyModel({
  id: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
  name: "Second Family",
  ownerId: "fab7eed4-8b42-44c5-ad57-c2152e35d8cf",
});

// endregion mocks

// region spies

const getCacheSpy = jest.spyOn(cache, "get");
const setCacheSpy = jest.spyOn(cache, "set");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Params) {
  return getFamilies(params ?? defaultParams, datasourcesMocks);
}

const spies = {
  cache: {
    get: getCacheSpy,
    set: setCacheSpy,
  },
  familyDatasource: jest.mocked(datasourcesMocks.familyDatasource),
};

const mocks = {
  defaultParams,
  firstFamily,
  secondFamily,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
