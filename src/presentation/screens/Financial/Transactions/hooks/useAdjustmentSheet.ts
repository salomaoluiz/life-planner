import { useState } from "react";

import { useCases } from "@application/useCases";

import TransactionUIModel from "../models/TransactionUIModel";
import runPendingChange from "../pending/runPendingChange";

// A balance adjustment cannot be edited (the API answers 422): tapping its row opens a sheet
// whose only action is Delete, which reverses its effect on the account balance.
// Spec 061: the sheet closes at once and the row stays in the list as "Deleting" until the API answers.
function useAdjustmentSheet() {
  const [item, setItem] = useState<TransactionUIModel>();

  function sendDelete(target: TransactionUIModel) {
    runPendingChange(
      {
        description: target.description,
        kind: "delete",
        previous: target.dto,
        target: { transactionId: target.id },
      },
      async () => {
        await useCases.deleteFinancialTransactionUseCase.execute({
          id: target.id,
          ownerId: target.ownerId,
        });
      },
      // An adjustment has no form to reopen: "Try again" sends the delete once more.
      () => sendDelete(target),
    );
  }

  return {
    item,
    onClose: () => setItem(undefined),
    onDelete: () => {
      if (!item) {
        return;
      }
      sendDelete(item);
      setItem(undefined);
    },
    onOpen: (next: TransactionUIModel) => setItem(next),
  };
}

export default useAdjustmentSheet;
