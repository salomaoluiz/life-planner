import {
  ActivityBatchItemEntity,
  ActivityEntityType,
  ActivityEntryEntity,
} from "@domain/entities/activity/ActivityEntity";
import { ModalName } from "@screens/Navigation/models/modalPath";

export type ActivityTarget =
  | { modal: ModalName; params: Record<string, string> }
  | { path: string };

interface TargetSource {
  assetId?: string;
  bookingDate?: null | string;
  entityId: null | string;
  entityType: ActivityEntityType;
}

// Spec 127 FR 12: where an item is normally edited. `null` when the item has no screen of its own (the CSV import).
export function resolveActivityTarget(
  source: TargetSource,
): ActivityTarget | null {
  const id = source.entityId;

  if (!id) {
    return null;
  }

  const asset = source.assetId ?? id;

  switch (source.entityType) {
    case "ACCOUNT":
    case "BALANCE_ADJUSTMENT":
      return { modal: "add_new_account", params: { id } };
    case "ASSET":
    case "FIXED_INCOME_TERMS":
      return { path: `/investments/asset/${id}` };
    case "CARD_EARLY_PAYMENT":
    case "CARD_REFUND":
    case "TRANSACTION":
      return { modal: "add_new_transaction", params: { id } };
    case "CATEGORY":
      return { modal: "add_new_category", params: { id } };
    case "CONVERSION":
    case "VALUATION":
      return { path: `/investments/asset/${asset}` };
    case "CREDIT_CARD":
      return { modal: "add_new_credit_card", params: { id } };
    case "INCOME":
      return source.assetId
        ? { modal: "investment_income", params: { assetId: asset, id } }
        : null;
    case "INCOME_SERIES":
      return { modal: "investment_income", params: { seriesId: id } };
    case "INSTALLMENT_PLAN":
    case "INSTALLMENT_PREPAYMENT":
    case "INVOICE_PAYMENT":
      return { path: "/financial/cards" };
    case "OPERATION":
      return source.assetId
        ? { modal: "investment_operation", params: { assetId: asset, id } }
        : null;
    case "RECURRENCE":
      return {
        modal: "add_new_transaction",
        params: {
          month: (source.bookingDate ?? "").slice(0, 7),
          occurrenceNumber: "1",
          recurrenceId: id,
        },
      };
    case "SPLIT":
      return { modal: "add_new_transaction", params: { splitId: id } };
    case "TAG":
      return { modal: "add_new_tag", params: { id } };
    case "TRANSFER":
      return { modal: "add_new_transaction", params: { transferId: id } };
    default:
      return null;
  }
}

export function targetOfEntry(entry: ActivityEntryEntity) {
  if (entry.action === "DELETE" || !entry.itemExists || entry.batch) {
    return null;
  }

  return resolveActivityTarget({
    assetId: assetIdOf(entry.summary.extra),
    bookingDate: entry.summary.bookingDate,
    entityId: entry.entityId,
    entityType: entry.entityType,
  });
}

// A batch item opens like a single item; investment items borrow the asset of their entry.
export function targetOfItem(
  item: ActivityBatchItemEntity,
  entryExtra: Record<string, unknown> | undefined,
) {
  if (item.action === "DELETE" || !item.itemExists) {
    return null;
  }

  return resolveActivityTarget({
    assetId: assetIdOf(entryExtra),
    bookingDate: item.bookingDate,
    entityId: item.entityId,
    entityType: item.entityType,
  });
}

function assetIdOf(extra: Record<string, unknown> | undefined) {
  return typeof extra?.assetId === "string" ? extra.assetId : undefined;
}
