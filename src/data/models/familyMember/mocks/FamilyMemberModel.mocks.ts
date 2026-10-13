import FamilyMemberModel from "../FamilyMemberModel";

// region mocks

const jsonMock = {
  email: "test@example.com",
  familyId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  inviteExpired: false,
  joinedAt: "2026-10-01T12:00:00.000Z",
  role: "OWNER",
  status: "JOINED",
  user: { name: "Test Owner", photoUrl: null },
  userId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
};

const pendingJsonMock = {
  email: "pending@example.com",
  familyId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  id: "c9d8e7f6-a5b4-4c3d-9e2f-1a0b9c8d7e6f",
  inviteExpired: true,
  joinedAt: null,
  role: "MEMBER",
  status: "PENDING",
  user: null,
  userId: null,
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
    familyId: jsonMock.familyId,
    id: jsonMock.id,
    inviteExpired: jsonMock.inviteExpired,
    joinedAt: jsonMock.joinedAt,
    role: jsonMock.role,
    status: jsonMock.status,
    user: { name: "Test Owner", photoUrl: undefined },
    userId: jsonMock.userId,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
  pendingJson: pendingJsonMock,
};

export { mocks, setup, spies };
