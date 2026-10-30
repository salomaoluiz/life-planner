import Repositories from "@domain/repositories";

const repositoriesMocks: Repositories = {
  cacheRepository: {
    invalidate: jest.fn(),
  },
  configsRepository: {
    getConfigs: jest.fn(),
    saveConfigs: jest.fn(),
  },
  familyMemberRepository: {
    deleteFamilyMember: jest.fn(),
    getFamilyMembers: jest.fn(),
    getInvite: jest.fn(),
    inviteFamilyMember: jest.fn(),
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
    account: {
      adjustAccountBalance: jest.fn(),
      createAccount: jest.fn(),
      deleteAccount: jest.fn(),
      getAccounts: jest.fn(),
      getDailyBalances: jest.fn(),
      updateAccount: jest.fn(),
    },
    cardCredit: {
      createEarlyPayment: jest.fn(),
      createRefund: jest.fn(),
      deleteEarlyPayment: jest.fn(),
      deleteRefund: jest.fn(),
      updateEarlyPayment: jest.fn(),
      updateRefund: jest.fn(),
    },
    category: {
      createCategory: jest.fn(),
      deleteCategory: jest.fn(),
      getCategories: jest.fn(),
      updateCategory: jest.fn(),
    },
    creditCard: {
      createCreditCard: jest.fn(),
      deleteCreditCard: jest.fn(),
      getCardInvoice: jest.fn(),
      getCardInvoicesForMonth: jest.fn(),
      getCreditCards: jest.fn(),
      getCreditCardsOverview: jest.fn(),
      payInvoice: jest.fn(),
      undoInvoicePayment: jest.fn(),
      updateCreditCard: jest.fn(),
    },
    dashboard: {
      getBalanceSeries: jest.fn(),
      getSummary: jest.fn(),
      getTotals: jest.fn(),
    },
    installmentPlan: {
      createInstallmentPlan: jest.fn(),
      deleteInstallmentPlan: jest.fn(),
      getInstallmentPlan: jest.fn(),
      prepayInstallmentPlan: jest.fn(),
      previewPrepayment: jest.fn(),
      undoPrepayment: jest.fn(),
      updateInstallmentPlan: jest.fn(),
    },
    recurrence: {
      createRecurrence: jest.fn(),
      deleteOccurrence: jest.fn(),
      deleteRecurrence: jest.fn(),
      getProjections: jest.fn(),
      getRecurrences: jest.fn(),
      materializeOccurrence: jest.fn(),
      splitRecurrence: jest.fn(),
      updateRecurrence: jest.fn(),
    },
    tag: {
      createTag: jest.fn(),
      deleteTag: jest.fn(),
      getTags: jest.fn(),
      updateTag: jest.fn(),
    },
    transaction: {
      createTransaction: jest.fn(),
      deleteTransaction: jest.fn(),
      exportTransactions: jest.fn(),
      getExportCount: jest.fn(),
      getFilteredTransactions: jest.fn(),
      getTransactions: jest.fn(),
      importTransactions: jest.fn(),
      updateTransaction: jest.fn(),
      validateImport: jest.fn(),
    },
  },
  loginRepository: {
    loginWithEmail: jest.fn(),
    logout: jest.fn(),
    signUpWithEmail: jest.fn(),
  },
  stockRepository: {
    createStockItem: jest.fn(),
    deleteStockItem: jest.fn(),
    getStockItems: jest.fn(),
    updateStockItem: jest.fn(),
  },
  userRepository: {
    deleteAccount: jest.fn(),
    getUser: jest.fn(),
    getUserById: jest.fn(),
  },
  versionRepository: {
    getVersionInfo: jest.fn(),
  },
};

export { repositoriesMocks };
