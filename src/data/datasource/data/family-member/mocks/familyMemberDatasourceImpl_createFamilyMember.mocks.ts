import { CreateFamilyMemberDatasourceParams } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { supabase } from "@infrastructure/supabase";

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
const supabaseInsertSpy = jest.fn();
const supabaseThenSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    insert: supabaseInsertSpy.mockReturnThis(),
    then: supabaseThenSpy,
  } as never;
});
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
  supabaseFrom: supabaseFromSpy,
  supabaseInsert: supabaseInsertSpy,
  supabaseThen: supabaseThenSpy,
};

const mocks = {
  defaultProps,
  responseError,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
