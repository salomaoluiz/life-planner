import { JoinFamilyMemberDatasourceParams } from "@data/repositories/repos/familyMember/familyMemberDatasource";
import { supabase } from "@infrastructure/supabase";

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
const supabaseUpdateSpy = jest.fn();
const supabaseThenSpy = jest.fn();
const supabaseEqSpy = jest.fn();

const supabaseFromSpy = jest.spyOn(supabase, "from").mockImplementation(() => {
  return {
    eq: supabaseEqSpy.mockReturnThis(),
    then: supabaseThenSpy,
    update: supabaseUpdateSpy.mockReturnThis(),
  } as never;
});
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
  supabaseEq: supabaseEqSpy,
  supabaseFrom: supabaseFromSpy,
  supabaseThen: supabaseThenSpy,
  supabaseUpdate: supabaseUpdateSpy,
};

const mocks = {
  defaultProps,
  responseError,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
