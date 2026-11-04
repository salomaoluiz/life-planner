import { financeKeys } from "@application/queryKeys/financeKeys";
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
import {
  invalidateAfterWrite,
  isPatchable,
  patchMonthLists,
  scopeOfChange,
} from "./writeCache";

// Runs the request of an optimistic change. On success the saved row is patched into the cached month lists (spec 076)
// before the change is cleared, so a row never disappears or doubles between the answer and the fresh data; then only
// the queries the write can move are refreshed. A failure rolls the change back and queues a toast.
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
    const patchable = isPatchable(registered);

    if (patchable) {
      patchMonthLists(registered, result?.id);
    }
    removeChange(registered.id);
    await invalidateAfterWrite(scopeOfChange(registered), {
      skipLists: patchable,
    });
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
    invalidateFetcherData(financeKeys.transactions.all());
  } finally {
    removeChange(registered.id);
  }
}

export default runPendingChange;
