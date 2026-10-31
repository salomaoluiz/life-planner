import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { RecurrenceScope } from "@domain/entities/financial/RecurrenceEntity";
import { PendingTarget } from "@screens/Financial/Transactions/pending/pendingChanges";
import { centsToDecimalString } from "@utils/money";

import { TransactionFormState } from "./transactionFormState";

// Spec 061 FR 4: the list row of a transaction that is still being saved, built from what the form holds.
interface PendingRowInput {
  accountName?: string;
  categoryName: string;
  id: string;
  // `YYYY-MM` of the invoice the purchase lands on (card purchases only).
  invoiceMonth?: string;
  owner: OwnerDTO;
  state: TransactionFormState;
}

// What a delete reaches: the row itself, or (a recurrence occurrence) the rows of its series by scope.
function buildDeleteTarget(
  existing: TransactionDTO,
  scope?: RecurrenceScope,
): PendingTarget {
  if (!existing.recurrenceId || !scope) {
    return { transactionId: existing.id };
  }

  return {
    fromOccurrence: existing.occurrenceNumber,
    recurrenceId: existing.recurrenceId,
    scope,
    transactionId: existing.id,
  };
}

function buildPendingRow(input: PendingRowInput): TransactionDTO {
  const { state } = input;
  const isCard = state.payWith === "CARD";

  return new TransactionDTO({
    accountId: isCard ? undefined : state.accountId,
    accountName: isCard ? undefined : input.accountName,
    category: input.categoryName,
    categoryId: state.categoryId!,
    categoryName: input.categoryName,
    creditCardId: isCard ? state.creditCardId : undefined,
    date: state.date.toISOString(),
    description: state.description.trim(),
    id: input.id,
    invoiceMonth: isCard ? input.invoiceMonth : undefined,
    notes: state.notes.trim() || undefined,
    owner: input.owner.type,
    ownerId: input.owner.id,
    paid: isCard ? true : state.paid,
    tags: state.tags.map((name) => ({ id: name, name })),
    type: state.type,
    value: centsToDecimalString(state.amountCents),
  });
}

export type { PendingRowInput };
export { buildDeleteTarget, buildPendingRow };
