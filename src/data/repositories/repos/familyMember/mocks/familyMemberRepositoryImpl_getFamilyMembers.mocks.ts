import { datasourcesMocks } from "@data/datasource/mocks";
import FamilyMemberModel from "@data/models/familyMember/FamilyMemberModel";
import cache from "@infrastructure/cache";

import familyMemberRepositoryImpl from "../familyMemberRepositoryImpl";

// region mocks
const getFamilyMembersSuccessMock = [
  new FamilyMemberModel({
    email: "test@gmail.com",
    familyId: "1111",
    id: "2222",
    inviteToken: "encoded-token",
    joinDate: new Date().toISOString(),
    userId: "1234",
  }),
  new FamilyMemberModel({
    email: "test2@gmail.com",
    familyId: "1111",
    id: "2223",
    inviteToken: "encoded-token",
    joinDate: undefined,
    userId: "1235",
  }),
];

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
  getFamilyMembersSuccessMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
