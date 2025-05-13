import { CreateFamilyMemberDatasourceParams } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import datasource from "../familyMemberDatasourceImpl";

// region mocks
const defaultProps = {
  email: "teste@gmail.com",
  familyId: "123",
  inviteToken: "fake_invite_token_jwt",
  joinDate: new Date("2021-01-01T00:00:00.000Z").toISOString(),
  userId: "321",
} as CreateFamilyMemberDatasourceParams;

const responseError = {
  error: new Error("Something wrong"),
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<CreateFamilyMemberDatasourceParams>) {
  return datasource().createFamilyMember({ ...defaultProps, ...props });
}

async function throwableSetup(props: CreateFamilyMemberDatasourceParams) {
  try {
    await setup(props);
  } catch (error) {
    return error;
  }
}
const spies = {
  ...supabase.spies,
};

const mocks = {
  defaultProps,
  responseError,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
