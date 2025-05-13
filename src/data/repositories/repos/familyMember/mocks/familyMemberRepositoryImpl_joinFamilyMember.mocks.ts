import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { JoinFamilyMemberRepositoryParams } from "@domain/repositories/familyMember";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const defaultProps = {
  inviteToken: "encoded-token",
  joinDate: new Date().toISOString(),
  userId: "1234",
} as JoinFamilyMemberRepositoryParams;

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

async function setup(props?: Partial<JoinFamilyMemberRepositoryParams>) {
  return familyMemberRepositoryImpl(datasourcesMocks).joinFamilyMember({
    ...defaultProps,
    ...props,
  });
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

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
