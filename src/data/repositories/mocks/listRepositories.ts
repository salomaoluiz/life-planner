import Repositories from "@domain/repositories";

const repositoriesMocks: Repositories = {
  configsRepository: {
    getConfigs: jest.fn(),
    saveConfigs: jest.fn(),
  },
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
    getFamilyById: jest.fn(),
    updateFamily: jest.fn(),
  },
  financialRepository: {
    transaction: {
      createTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      getTransactions: jest.fn(),
      invalidateTransactions: jest.fn(),
      updateTransaction: jest.fn(),
    },
  },
  loginRepository: {
    loginWithGoogle: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  stockRepository: {
    createStockItem: jest.fn(),
    deleteStockItem: jest.fn(),
    getStockItems: jest.fn(),
    updateStockItem: jest.fn(),
  },
  userRepository: {
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserById: jest.fn(),
  },
};

export { repositoriesMocks };
