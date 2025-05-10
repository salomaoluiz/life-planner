import { listUseCases } from "./index";

const useCases = {
  createFamilyUseCase: expect.any(Function),
  createFinancialTransactionUseCase: expect.any(Function),
  createStockItemUseCase: expect.any(Function),
  deleteFamilyMemberUseCase: expect.any(Function),
  deleteFamilyUseCase: expect.any(Function),
  deleteFinancialTransactionUseCase: expect.any(Function),
  deleteStockItemUseCase: expect.any(Function),
  getFamiliesUseCase: expect.any(Function),
  getFamilyByIdUseCase: expect.any(Function),
  getFamilyMembersUseCase: expect.any(Function),
  getFinancialTransactionsUseCase: expect.any(Function),
  getOwnersUseCase: expect.any(Function),
  getStockDashboardUseCase: expect.any(Function),
  getStockItemsUseCase: expect.any(Function),
  getUserByUserIdUseCase: expect.any(Function),
  getUserConfigsUseCase: expect.any(Function),
  getUserUseCase: expect.any(Function),
  inviteFamilyMemberUseCase: expect.any(Function),
  joinFamilyMemberUseCase: expect.any(Function),
  loginWithGoogleUseCase: expect.any(Function),
  logoutUseCase: expect.any(Function),
  refreshFinancialTransactionsUseCase: expect.any(Function),
  saveUserConfigsUseCase: expect.any(Function),
  saveWebSessionUseCase: expect.any(Function),
  updateFamilyUseCase: expect.any(Function),
  updateFinancialTransactionUseCase: expect.any(Function),
  updateStockItemUseCase: expect.any(Function),
};

it("SHOULD return a list of use cases", () => {
  expect(listUseCases).toEqual(useCases);
});
