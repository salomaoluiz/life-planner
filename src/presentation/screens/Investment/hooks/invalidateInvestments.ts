import { investmentKeys } from "@application/queryKeys/investmentKeys";
import { invalidateFetcherData } from "@infrastructure/fetcher";
import invalidateFinanceData from "@screens/Financial/hooks/invalidateFinanceData";

// Spec 102 FR 40: an investment write moves the investment screens AND the finance data (account balances,
// transactions), so both are invalidated.
async function invalidateInvestments() {
  await Promise.all([
    invalidateFetcherData(investmentKeys.all()),
    invalidateFinanceData(),
  ]);
}

export default invalidateInvestments;
