import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { useCases } from "@application/useCases";
import { openConfirmPaymentModal } from "@screens/Financial/Transactions/pending/openTransactionModal";
import runPendingChange from "@screens/Financial/Transactions/pending/runPendingChange";

import {
  buildPaidRow,
  buildPayParams,
  DateChoice,
} from "../models/confirmPayState";
import { setPayRequest } from "../models/payRequest";

interface Submission {
  cents: number;
  choice: DateChoice;
  dateIso: string;
  other?: Date;
}

// Spec 097 FR 7-8: the confirmed payment goes through the 061 queue as an edit; a failure's "Try again" reopens the
// confirmation modal with the value and date the user had chosen.
function submitPayment(item: TransactionDTO, submission: Submission) {
  const input = { cents: submission.cents, dateIso: submission.dateIso };

  void runPendingChange(
    {
      action: item.type === "INCOME" ? "receive" : "pay",
      description: item.description,
      kind: "edit",
      previous: item,
      row: buildPaidRow(item, input),
    },
    async () =>
      useCases.updateFinancialTransactionUseCase.execute(
        buildPayParams(item, input),
      ),
    () => {
      setPayRequest({
        draft: {
          cents: submission.cents,
          choice: submission.choice,
          other: submission.other,
        },
        item,
      });
      openConfirmPaymentModal();
    },
  );
}

export type { Submission };
export default submitPayment;
