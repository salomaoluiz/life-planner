import { router } from "expo-router";

import { buildModalPath } from "@screens/Navigation/models/modalPath";

const TRANSACTIONS_PATH = "/financial/transaction";

// "Try again" can fire on any screen (spec 061 FR 11): it opens the transaction modal over the transactions route.
function openTransactionModal(params?: Record<string, string>) {
  router.push({
    params,
    pathname: buildModalPath(TRANSACTIONS_PATH, "add_new_transaction"),
  } as never);
}

export default openTransactionModal;
