// Mocked fixtures keep the short names their use case mocks always had; the factory names a resource by its property.
const FIXTURE_NAMES: Record<string, string> = {
  creditCards: "cards",
  creditCardsOverview: "overview",
  installmentPlans: "plan",
  transactionsFiltered: "filteredTransactions",
};

// The name a mocked `useQuery`/`useMutation` fixture is registered under: the resource of a finance key
// (`["finance", "accounts", ...]` → `"accounts"`), otherwise the first part of the key (the use case name).
function queryName(cacheKey: string[]) {
  if (cacheKey[0] !== "finance") {
    return cacheKey[0];
  }

  return FIXTURE_NAMES[cacheKey[1]] ?? cacheKey[1];
}

export default queryName;

const USE_CASE_NAMES: Record<string, string> = {
  accounts: "getFinancialAccountsUseCase",
  categories: "getFinancialCategoriesUseCase",
  creditCards: "getFinancialCreditCardsUseCase",
  creditCardsOverview: "getFinancialCreditCardsOverviewUseCase",
  installmentPlans: "getFinancialInstallmentPlanUseCase",
  invoice: "getFinancialCardInvoiceUseCase",
  transactions: "getFinancialTransactionsUseCase",
};

// Same, for mocks whose fixtures are named after the whole use case (`getFinancialAccountsUseCase`).
function useCaseQueryName(cacheKey: string[]) {
  if (cacheKey[0] !== "finance") {
    return cacheKey[0];
  }

  return USE_CASE_NAMES[cacheKey[1]] ?? cacheKey[1];
}

export { useCaseQueryName };
