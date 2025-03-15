import Repositories from "@domain/repositories";

const repositoriesMocks = {
  familyMemberRepository: {
    createFamilyMember: jest.fn(),
    deleteFamilyMember: jest.fn(),
    getFamilyMembers: jest.fn(),
    joinFamilyMember: jest.fn(),
  },
  familyRepository: {
    createFamily: jest.fn(),
    deleteFamily: jest.fn(),
    getFamilies: jest.fn(),
    updateFamily: jest.fn(),
  },
  loginRepository: {
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  userRepository: {
    getUser: jest.fn(),
  },
} as Repositories;

export { repositoriesMocks };
