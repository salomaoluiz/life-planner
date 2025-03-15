import { Datasources } from "@data/datasource";

const datasourcesMocks: jest.MockedObjectDeep<Datasources> = {
  familyDatasource: {
    createFamily: jest.fn(),
    deleteFamily: jest.fn(),
    getFamilies: jest.fn(),
    updateFamily: jest.fn(),
  },
  familyMemberDatasource: {
    createFamilyMember: jest.fn(),
    deleteFamilyMember: jest.fn(),
    getFamilyMembers: jest.fn(),
    joinFamilyMember: jest.fn(),
  },
  loginDatasource: {
    loginWithIdToken: jest.fn(),
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  userDatasource: {
    getUser: jest.fn(),
  },
};

export { datasourcesMocks };
