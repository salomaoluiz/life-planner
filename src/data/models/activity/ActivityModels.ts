import {
  ACTIVITY_ENTITY_TYPES,
  ActivityAction,
  ActivityBatchHeaderEntity,
  ActivityBatchItemEntity,
  ActivityBatchPageEntity,
  ActivityChangeEntity,
  ActivityEntryEntity,
  ActivityModule,
  ActivityOwnerType,
  ActivityPageEntity,
  ActivitySummaryEntity,
} from "@domain/entities/activity/ActivityEntity";

type Json = Record<string, unknown>;

const ACTIONS: ActivityAction[] = ["CREATE", "DELETE", "UPDATE"];
const MODULES: ActivityModule[] = ["FINANCE", "INVESTMENT"];
const OWNER_TYPES: ActivityOwnerType[] = ["FAMILY", "USER"];

// API shapes of `/v1/activity` (spec 127). Tolerant: a missing list is empty, an unknown enum falls back.
class ActivityModels {
  static batchPageFromJSON(data: Json): ActivityBatchPageEntity {
    const header = data.header as Json | null | undefined;

    return {
      header: header ? headerFromJSON(header) : null,
      items: list(data.items).map((item) => batchItemFromJSON(item)),
      nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
    };
  }

  static pageFromJSON(data: Json): ActivityPageEntity {
    return {
      items: list(data.items).map((entry) => entryFromJSON(entry)),
      nextCursor: typeof data.nextCursor === "string" ? data.nextCursor : null,
    };
  }
}

function batchItemFromJSON(data: Json): ActivityBatchItemEntity {
  return {
    action: pick(ACTIONS, data.action, "CREATE"),
    amountCents: numberOrNull(data.amountCents),
    bookingDate: stringOrNull(data.bookingDate),
    currency: stringOrNull(data.currency),
    entityId: String(data.entityId ?? ""),
    entityType: pick(ACTIVITY_ENTITY_TYPES, data.entityType, "TRANSACTION"),
    itemExists: data.itemExists === true,
    label: String(data.label ?? ""),
    sourceName: stringOrNull(data.sourceName),
  };
}

function changeFromJSON(data: Json): ActivityChangeEntity {
  return { field: String(data.field ?? ""), from: data.from, to: data.to };
}

function entryFromJSON(data: Json): ActivityEntryEntity {
  const actor = (data.actor ?? {}) as Json;
  const owner = (data.owner ?? {}) as Json;
  const preview = data.batchPreview as Json | null | undefined;

  return {
    action: pick(ACTIONS, data.action, "CREATE"),
    actor: { id: stringOrNull(actor.id), name: String(actor.name ?? "") },
    batch: data.batch === true,
    batchPreview: preview
      ? {
          count: Number(preview.count ?? 0),
          labels: list(preview.labels).map(String) as unknown as string[],
        }
      : null,
    changes: Array.isArray(data.changes)
      ? (data.changes as Json[]).map((change) => changeFromJSON(change))
      : null,
    entityId: stringOrNull(data.entityId),
    entityType: pick(ACTIVITY_ENTITY_TYPES, data.entityType, "TRANSACTION"),
    id: String(data.id ?? ""),
    itemExists: data.itemExists === true,
    modules: list(data.modules)
      .map((module) => pick(MODULES, module, "FINANCE"))
      .filter((module, index, all) => all.indexOf(module) === index),
    occurredAt: String(data.occurredAt ?? ""),
    owner: {
      id: String(owner.id ?? ""),
      name: String(owner.name ?? ""),
      type: pick(OWNER_TYPES, owner.type, "USER"),
    },
    summary: summaryFromJSON((data.summary ?? {}) as Json),
  };
}

function headerFromJSON(data: Json): ActivityBatchHeaderEntity {
  return {
    bookingFrom: stringOrNull(data.bookingFrom),
    bookingTo: stringOrNull(data.bookingTo),
    count: Number(data.count ?? 0),
    existing: Number(data.existing ?? 0),
    sources: list(data.sources).map(String) as unknown as string[],
    totals: list(data.totals).map((total) => ({
      amountCents: Number(total.amountCents ?? 0),
      currency: String(total.currency ?? ""),
    })),
  };
}

function list(value: unknown): Json[] {
  return Array.isArray(value) ? (value as Json[]) : [];
}

function numberOrNull(value: unknown): null | number {
  return typeof value === "number" ? value : null;
}

function pick<T extends string>(
  allowed: readonly T[],
  value: unknown,
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function stringOrNull(value: unknown): null | string {
  return typeof value === "string" ? value : null;
}

function summaryFromJSON(data: Json): ActivitySummaryEntity {
  return {
    amountCents: numberOrNull(data.amountCents) ?? undefined,
    bookingDate: stringOrNull(data.bookingDate) ?? undefined,
    currency: stringOrNull(data.currency) ?? undefined,
    extra:
      data.extra && typeof data.extra === "object"
        ? (data.extra as Record<string, unknown>)
        : undefined,
    label: String(data.label ?? ""),
    sources: Array.isArray(data.sources)
      ? (data.sources as unknown[]).map(String)
      : undefined,
  };
}

export default ActivityModels;
