import {
  UpcomingEntity,
  UpcomingItemEntity,
  UpcomingKind,
} from "@domain/entities/financial/UpcomingEntity";

type Json = Record<string, unknown>;

// API shape of `GET /v1/finance/upcoming` (spec 062); money stays in cents.
class UpcomingModel {
  static fromJSON(data: Json): UpcomingEntity {
    const totals = (data.overdueTotals ?? {}) as Json;

    return {
      next: list(data.next).map(item),
      nextTotal: Number(data.nextTotal ?? 0),
      overdue: list(data.overdue).map(item),
      overdueTotals: {
        expenseCents: Number(totals.expenseCents ?? 0),
        incomeCents: Number(totals.incomeCents ?? 0),
      },
    };
  }
}

function item(data: Json): UpcomingItemEntity {
  return {
    accountId: (data.accountId as null | string) ?? null,
    categoryId: (data.categoryId as null | string) ?? null,
    creditCardId: (data.creditCardId as null | string) ?? null,
    currency: data.currency as string,
    date: data.date as string,
    description: data.description as string,
    id: data.id as string,
    invoiceMonth: (data.invoiceMonth as null | string) ?? null,
    kind: data.kind as UpcomingKind,
    occurrenceNumber:
      data.occurrenceNumber === null || data.occurrenceNumber === undefined
        ? null
        : Number(data.occurrenceNumber),
    owner: data.owner as string,
    ownerId: data.ownerId as string,
    projectedAmount:
      data.projectedAmount === undefined
        ? undefined
        : Number(data.projectedAmount),
    purchaseCount:
      data.purchaseCount === null || data.purchaseCount === undefined
        ? null
        : Number(data.purchaseCount),
    recurrenceId: (data.recurrenceId as null | string) ?? null,
    type: data.type as "EXPENSE" | "INCOME",
    valueCents: Number(data.valueCents),
  };
}

function list(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

export default UpcomingModel;
