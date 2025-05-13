import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { CreateFamilyMemberRepositoryParams } from "@domain/repositories/familyMember";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const defaultProps = {
  email: "test@gmail.com",
  familyId: "123",
  inviteToken: "123",
  joinDate: new Date().toISOString(),
  userId: "123",
} as CreateFamilyMemberRepositoryParams;

// endregion mocks

// region spies

const createFamilyMemberSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "createFamilyMember",
);
const invalidateSpy = jest.spyOn(cache, "invalidate");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<CreateFamilyMemberRepositoryParams>) {
  return familyMemberRepositoryImpl(datasourcesMocks).createFamilyMember({
    ...defaultProps,
    ...props,
  });
}

const spies = {
  cache: {
    invalidate: invalidateSpy,
  },
  createFamilyMember: createFamilyMemberSpy,
};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
