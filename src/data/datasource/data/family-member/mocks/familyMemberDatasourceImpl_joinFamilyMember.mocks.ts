import { JoinFamilyMemberDatasourceParams } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import * as supabase from "@infrastructure/supabase/mocks/index.mocks";

import datasource from "../familyMemberDatasourceImpl";

// region mocks
const defaultProps = {
  inviteToken: "invite_token_jwt",
  joinDate: new Date("2021-09-01T00:00:00.000Z").toISOString(),
  userId: "123",
} as JoinFamilyMemberDatasourceParams;

const responseError = {
  error: new Error("Something wrong"),
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<JoinFamilyMemberDatasourceParams>) {
  return datasource().joinFamilyMember({ ...defaultProps, ...props });
}

async function throwableSetup(props: JoinFamilyMemberDatasourceParams) {
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
