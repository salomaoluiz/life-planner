import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { JoinFamilyMemberRepositoryParams } from "@domain/repositories/familyMember";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const defaultProps: JoinFamilyMemberRepositoryParams = {
  inviteToken: "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI",
};

// endregion mocks

// region spies

const joinFamilyMemberSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "joinFamilyMember",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return familyMemberRepositoryImpl(datasourcesMocks).joinFamilyMember(
    defaultProps,
  );
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  joinFamilyMember: joinFamilyMemberSpy,
};

const mocks = {
  defaultProps,
};

export { mocks, setup, spies };
