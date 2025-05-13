import FamilyMemberModel from "../FamilyMemberModel";

// region mocks

const jsonMock = {
  email: "teste@gmail.com",
  family_id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  invite_token: "invite_token_hash",
  join_date: "2025-05-05T00:00:00.000Z",
  user_id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new FamilyMemberModel({
    email: jsonMock.email,
    familyId: jsonMock.family_id,
    id: jsonMock.id,
    inviteToken: jsonMock.invite_token,
    joinDate: jsonMock.join_date,
    userId: jsonMock.user_id,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
