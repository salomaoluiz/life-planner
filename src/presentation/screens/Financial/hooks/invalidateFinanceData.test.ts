import { useCases } from "@application/useCases";
import {
  invalidateFetcherData,
  markFetcherDataStale,
} from "@infrastructure/fetcher";

import invalidateFinanceData from "./invalidateFinanceData";

jest.mock("@infrastructure/fetcher");

it("SHOULD invalidate every cache a finance write can change, one key prefix each", async () => {
  await invalidateFinanceData();

  const keys = jest
    .mocked(invalidateFetcherData)
    .mock.calls.map(([prefix]) => prefix);

  expect(keys).toEqual(
    expect.arrayContaining([
      [useCases.getFinancialTransactionsUseCase.uniqueName],
      [useCases.getFinancialFilteredTransactionsUseCase.uniqueName],
      [useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName],
      [useCases.getFinancialCardInvoiceUseCase.uniqueName],
      [useCases.getFinancialProjectionsUseCase.uniqueName],
      [useCases.getMonthSummaryUseCase.uniqueName],
      [useCases.getFinancialDailyBalancesUseCase.uniqueName],
      [useCases.getFinancialAccountsUseCase.uniqueName],
      [useCases.getFinancialCreditCardsUseCase.uniqueName],
      [useCases.getFinancialCreditCardsOverviewUseCase.uniqueName],
      [useCases.getFinancialInstallmentPlanUseCase.uniqueName],
      [useCases.getFinancialRecurrencesUseCase.uniqueName],
      [useCases.getFinancialCategoriesUseCase.uniqueName],
      [useCases.getFinancialTagsUseCase.uniqueName],
    ]),
  );
  keys.forEach((prefix) => expect(prefix).toHaveLength(1));
});

it("SHOULD only mark the caches stale WHEN asked not to refetch now (a write made in a modal over the screen)", async () => {
  jest.clearAllMocks();

  await invalidateFinanceData({ refetch: false });

  expect(invalidateFetcherData).not.toHaveBeenCalled();
  expect(markFetcherDataStale).toHaveBeenCalledWith([
    useCases.getFinancialTransactionsUseCase.uniqueName,
  ]);
  expect(markFetcherDataStale).toHaveBeenCalledWith([
    useCases.getMonthSummaryUseCase.uniqueName,
  ]);
});
