import { useCases } from "@application/useCases";
import { invalidateFetcherData } from "@infrastructure/fetcher";

// A finance write (a transaction, an invoice payment, an account, a category...) can change many cached screens: lists,
// invoices, balances, summaries, projections, card limits. Data stays fresh for 30 s (spec 073), so a write must mark
// all of them stale itself instead of relying on the next focus or mount. Only the mounted queries refetch at once.
// One call per key prefix: `invalidateFetcherData([a, b])` would mean the single prefix `a → b`.
async function invalidateFinanceData() {
  await Promise.all(
    [
      useCases.getFinancialTransactionsUseCase.uniqueName,
      useCases.getFinancialFilteredTransactionsUseCase.uniqueName,
      useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
      useCases.getFinancialCardInvoiceUseCase.uniqueName,
      useCases.getFinancialProjectionsUseCase.uniqueName,
      useCases.getMonthSummaryUseCase.uniqueName,
      useCases.getFinancialDailyBalancesUseCase.uniqueName,
      useCases.getFinancialAccountsUseCase.uniqueName,
      useCases.getFinancialCreditCardsUseCase.uniqueName,
      useCases.getFinancialCreditCardsOverviewUseCase.uniqueName,
      useCases.getFinancialInstallmentPlanUseCase.uniqueName,
      useCases.getFinancialRecurrencesUseCase.uniqueName,
      useCases.getFinancialCategoriesUseCase.uniqueName,
      useCases.getFinancialTagsUseCase.uniqueName,
    ].map(async (key) => invalidateFetcherData([key])),
  );
}

export default invalidateFinanceData;
