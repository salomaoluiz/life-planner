import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { PendingChange, PendingTarget } from "../pending/pendingChanges";
import CardInvoiceUIModel, {
  InvoiceOverlay,
  InvoicePurchaseUIModel,
} from "./CardInvoiceUIModel";
import TransactionUIModel from "./TransactionUIModel";

// Spec 061 FR 4-8: the loaded rows plus what running requests are about to change. Pure: the inputs are not touched
// and the React Query cache never holds a pending row, so a refetch can neither drop nor double it.
interface PendingContext {
  categoryById: Map<string, CategoryDTO>;
  // The row would be listed with the month on screen and the active filters.
  matches: (row: TransactionDTO) => boolean;
}

function applyPendingToInvoices(
  invoices: CardInvoiceUIModel[],
  changes: readonly PendingChange[],
  context: PendingContext,
): CardInvoiceUIModel[] {
  if (changes.length === 0) {
    return invoices;
  }

  return invoices.map((invoice) => {
    const overlay: InvoiceOverlay = {
      added: [],
      replaced: new Map(),
      states: new Map(),
    };
    const storedIds = new Set(invoice.purchaseIds);
    let projected = invoice.projectedItems;

    changes.forEach((change) => {
      const row = change.row;

      if (change.kind === "create" && row) {
        if (
          belongsTo(invoice, row) &&
          context.matches(row) &&
          !isCreatedAlready(change, storedIds)
        ) {
          overlay.added.push(toPurchase(row, context));
        }

        return;
      }
      if (change.kind === "edit" && row && change.previous) {
        const previousId = change.previous.id;
        const had = storedIds.has(previousId);

        if (belongsTo(invoice, row) && context.matches(row)) {
          if (had) {
            overlay.replaced.set(previousId, toPurchase(row, context));
          } else {
            overlay.added.push(toPurchase(row, context));
          }
        } else if (had) {
          overlay.states.set(previousId, "deleting");
        }

        return;
      }
      if (change.kind === "delete") {
        storedIds.forEach((id) => {
          if (matchesTarget(change.target, { id })) {
            overlay.states.set(id, "deleting");
          }
        });
        projected = projected.map((item) =>
          matchesTarget(change.target, item)
            ? item.withPendingState("deleting")
            : item,
        );
      }
    });

    const untouched =
      overlay.added.length === 0 &&
      overlay.replaced.size === 0 &&
      overlay.states.size === 0 &&
      projected === invoice.projectedItems;

    return untouched ? invoice : invoice.withOverlay(overlay, projected);
  });
}

function applyPendingToItems(
  items: TransactionUIModel[],
  changes: readonly PendingChange[],
  context: PendingContext,
): TransactionUIModel[] {
  let result = [...items];

  function markDeleting(predicate: (item: TransactionUIModel) => boolean) {
    result = result.map((item) =>
      predicate(item) ? item.withPendingState("deleting") : item,
    );
  }

  changes.forEach((change) => {
    const row = change.row;

    if (change.kind === "create" && row) {
      if (
        row.creditCardId ||
        isCreatedAlready(
          change,
          result.map((item) => item.id),
        ) ||
        !context.matches(row)
      ) {
        return;
      }
      result.push(
        new TransactionUIModel(
          row,
          context.categoryById.get(row.categoryId),
          "saving",
        ),
      );

      return;
    }
    if (change.kind === "edit" && row && change.previous) {
      const previousId = change.previous.id;
      const stays = !row.creditCardId && context.matches(row);
      const exists = result.some((item) => item.id === previousId);

      if (stays) {
        const edited = new TransactionUIModel(
          row,
          context.categoryById.get(row.categoryId),
          "saving",
        );

        result = exists
          ? result.map((item) => (item.id === previousId ? edited : item))
          : [...result, edited];
      } else {
        markDeleting((item) => item.id === previousId);
      }

      return;
    }
    if (change.kind === "delete") {
      markDeleting((item) => matchesTarget(change.target, item));
    }
  });

  return result;
}

function belongsTo(invoice: CardInvoiceUIModel, row: TransactionDTO) {
  return (
    row.creditCardId === invoice.cardId &&
    row.invoiceMonth === invoice.referenceMonth
  );
}

function isCreatedAlready(change: PendingChange, ids: Iterable<string>) {
  if (!change.resolvedId) {
    return false;
  }
  for (const id of ids) {
    if (id === change.resolvedId) {
      return true;
    }
  }

  return false;
}

function matchesTarget(
  target: PendingTarget | undefined,
  row: { id: string; occurrenceNumber?: number; recurrenceId?: string },
) {
  if (!target) {
    return false;
  }
  if (target.transactionId && row.id === target.transactionId) {
    return true;
  }
  if (!target.recurrenceId || row.recurrenceId !== target.recurrenceId) {
    return false;
  }
  if (target.scope === "ALL") {
    return true;
  }
  if (row.occurrenceNumber === undefined) {
    return false;
  }

  return target.scope === "THIS_AND_NEXT"
    ? row.occurrenceNumber >= (target.fromOccurrence ?? 0)
    : row.occurrenceNumber === target.fromOccurrence;
}

function toPurchase(
  row: TransactionDTO,
  context: PendingContext,
): InvoicePurchaseUIModel {
  const ui = new TransactionUIModel(
    row,
    context.categoryById.get(row.categoryId),
    "saving",
  );

  return {
    amountCents: ui.amountCents,
    categoryColor: ui.categoryColor,
    categoryIcon: ui.categoryIcon,
    categoryName: ui.categoryName,
    date: ui.date,
    description: ui.description,
    id: row.id,
    notes: ui.notes,
    pendingState: "saving",
    prepaid: false,
  };
}

export type { PendingContext };
export { applyPendingToInvoices, applyPendingToItems };
