import { Datasources } from "@data/datasource";

const datasourcesMocks: jest.MockedObjectDeep<Datasources> = {
  familyDatasource: {
    createFamily: jest.fn(),
    deleteFamily: jest.fn(),
    getFamilies: jest.fn(),
    getFamilyById: jest.fn(),
    updateFamily: jest.fn(),
  },
  familyMemberDatasource: {
    createFamilyMember: jest.fn(),
    deleteFamilyMember: jest.fn(),
    getFamilyMembers: jest.fn(),
    joinFamilyMember: jest.fn(),
  },
  financialCategoryDatasource: {
    createCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getCategories: jest.fn(),
    updateCategory: jest.fn(),
  },
  financialTransactionDatasource: {
    createTransaction: jest.fn(),
    deleteTransaction: jest.fn(),
    getTransactions: jest.fn(),
    updateTransaction: jest.fn(),
  },
  loginDatasource: {
    loginWithIdToken: jest.fn(),
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  stockDatasource: {
    createStockItem: jest.fn(),
    deleteStockItem: jest.fn(),
    getStockItems: jest.fn(),
    updateStockItem: jest.fn(),
  },
  userDatasource: {
    createUser: jest.fn(),
    getUser: jest.fn(),
    getUserById: jest.fn(),
  },
};

export { datasourcesMocks };
