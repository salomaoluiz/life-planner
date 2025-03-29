import { datasourcesMocks } from "@data/datasource/mocks";
import FamilyModel from "@data/models/family/FamilyModel";
import cache from "@infrastructure/cache";

import transactionRepositoryImpl from "../transactionRepositoryImpl";

// region mocks
const getFamiliesSuccessMock = [
  new FamilyModel({
    id: "123",
    name: "Family Name",
    ownerId: "123",
  }),
];

const getFamiliesSuccessCacheMock = getFamiliesSuccessMock.map((family) =>
  family.toJSON(),
);
// endregion mocks

// region spies

const getFamiliesSpy = jest.spyOn(
  datasourcesMocks.familyDatasource,
  "getFamilies",
);
const getSpy = jest.spyOn(cache, "get");
const setSpy = jest.spyOn(cache, "set");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return transactionRepositoryImpl(datasourcesMocks).getFamilies("1234");
}

const spies = {
  cache: {
    get: getSpy,
    set: setSpy,
  },
  getFamilies: getFamiliesSpy,
};

const mocks = {
  getFamiliesSuccessCacheMock,
  getFamiliesSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
