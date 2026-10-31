import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";
import { invalidateFetcherData } from "@infrastructure/fetcher";
import { getFinancialErrorMessageKey } from "@screens/Financial/utils/financialErrorMessage";

import {
  addChange,
  addFailure,
  newPendingId,
  PendingChange,
  removeChange,
  resolveChange,
} from "./pendingChanges";

// Every query the transactions screen reads (spec 061 FR 12), by the prefix of its cache key.
function listCachePrefixes() {
  return [
    useCases.getFinancialTransactionsUseCase.uniqueName,
    useCases.getFinancialFilteredTransactionsUseCase.uniqueName,
    useCases.getFinancialCardInvoicesForMonthUseCase.uniqueName,
    useCases.getFinancialProjectionsUseCase.uniqueName,
    useCases.getMonthSummaryUseCase.uniqueName,
    useCases.getFinancialDailyBalancesUseCase.uniqueName,
  ];
}

// Runs the request of an optimistic change. The change stays registered until the lists refetched, so a row never
// disappears or doubles between the answer and the fresh data. A failure rolls the change back and queues a toast.
async function runPendingChange(
  change: Omit<PendingChange, "id"> & { id?: string },
  execute: () => Promise<undefined | void | { id?: string }>,
  retry: () => void,
) {
  const registered: PendingChange = {
    ...change,
    id: change.id ?? newPendingId(),
  };

  addChange(registered);
  try {
    const result = await execute();

    if (result && result.id) {
      resolveChange(registered.id, result.id);
    }
    await Promise.all(
      listCachePrefixes().map(async (prefix) =>
        invalidateFetcherData([prefix]),
      ),
    );
  } catch (error) {
    addFailure({
      description: registered.description,
      id: registered.id,
      kind: registered.kind,
      // Only a business error (paid invoice, archived account...) has copy of its own; the rest is the generic text.
      messageKey:
        error instanceof BusinessError
          ? getFinancialErrorMessageKey(error)
          : undefined,
      retry,
    });
    // The server data may have changed even on failure (partial success): refresh quietly.
    invalidateFetcherData([
      useCases.getFinancialTransactionsUseCase.uniqueName,
    ]);
  } finally {
    removeChange(registered.id);
  }
}

export default runPendingChange;
