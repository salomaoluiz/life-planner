import { TransactionQueryFilter } from "@domain/entities/financial/TransactionQueryFilter";

type FilterKey = keyof TransactionQueryFilter;

const PARAM_BY_LIST = {
  accountIds: "accountId",
  categoryIds: "categoryId",
  creditCardIds: "creditCardId",
  tagIds: "tagId",
} as const;

// Appends the filters (only the `keys` the endpoint understands) as repeatable query params.
function appendFilterParams(
  query: URLSearchParams,
  filter: TransactionQueryFilter | undefined,
  keys: FilterKey[],
) {
  if (!filter) {
    return;
  }

  const allowed = new Set(keys);

  (Object.keys(PARAM_BY_LIST) as (keyof typeof PARAM_BY_LIST)[]).forEach(
    (key) => {
      if (allowed.has(key)) {
        (filter[key] ?? []).forEach((id) =>
          query.append(PARAM_BY_LIST[key], id),
        );
      }
    },
  );
  if (allowed.has("from") && filter.from && filter.to) {
    query.append("from", filter.from);
    query.append("to", filter.to);
  }
  if (allowed.has("paid") && filter.paid !== undefined) {
    query.append("paid", String(filter.paid));
  }
  if (allowed.has("q") && filter.q?.trim()) {
    query.append("q", filter.q.trim());
  }
}

export default appendFilterParams;
