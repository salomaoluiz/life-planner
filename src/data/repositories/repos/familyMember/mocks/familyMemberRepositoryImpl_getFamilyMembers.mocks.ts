import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import FamilyMemberEntity from "@domain/entities/familyMember/FamilyMemberEntity";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const getFamilyMembersSuccessMock = [
  new FamilyMemberModel({
    email: "test@example.com",
    familyId: "1111",
    id: "2222",
    inviteExpired: false,
    joinedAt: "2026-10-01T12:00:00.000Z",
    role: "OWNER",
    status: "JOINED",
    user: { name: "Test Owner", photoUrl: "https://example.test/o.png" },
    userId: "1234",
  }),
  new FamilyMemberModel({
    email: "pending@example.com",
    familyId: "1111",
    id: "2223",
    inviteExpired: true,
    role: "MEMBER",
    status: "PENDING",
  }),
];

const expectedEntities = [
  new FamilyMemberEntity({
    email: "test@example.com",
    familyId: "1111",
    id: "2222",
    inviteExpired: false,
    joinedAt: new Date("2026-10-01T12:00:00.000Z"),
    name: "Test Owner",
    photoUrl: "https://example.test/o.png",
    role: FamilyMemberRole.OWNER,
    status: FamilyMemberStatus.JOINED,
    userId: "1234",
  }),
  new FamilyMemberEntity({
    email: "pending@example.com",
    familyId: "1111",
    id: "2223",
    inviteExpired: true,
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
  }),
];

const getFamilyMembersSuccessCacheMock = getFamilyMembersSuccessMock.map(
  (familyMember) => familyMember.toJSON(),
);

// endregion mocks

// region spies

const getFamilyMembersSpy = jest.spyOn(
  datasourcesMocks.familyMemberDatasource,
  "getFamilyMembers",
);
const getSpy = jest.spyOn(cache, "get");
const setSpy = jest.spyOn(cache, "set");
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup() {
  return familyMemberRepositoryImpl(datasourcesMocks).getFamilyMembers("1234");
}

const spies = {
  cache: {
    get: getSpy,
    set: setSpy,
  },
  getFamilyMembers: getFamilyMembersSpy,
};

const mocks = {
  expectedEntities,
  getFamilyMembersSuccessCacheMock,
  getFamilyMembersSuccessMock,
};

export { mocks, setup, spies };
