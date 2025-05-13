import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks

// endregion mocks

// region spies

const deleteFamilyMemberSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "deleteFamilyMember",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return familyMemberRepositoryImpl(datasourcesMocks).deleteFamilyMember(
    "1234",
  );
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  deleteFamilyMember: deleteFamilyMemberSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
