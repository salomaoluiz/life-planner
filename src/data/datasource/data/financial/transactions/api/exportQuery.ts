import { ExportQuery } from "@domain/entities/financial/TransactionCsv";

// The query string shared by the export and its count: `from`/`to` are required, ids repeat.
function exportParams(query: ExportQuery): URLSearchParams {
  const params = new URLSearchParams({
    from: query.from,
    owner: query.owner,
    to: query.to,
  });

  if (query.owner === "FAMILY" && query.ownerId) {
    params.append("ownerId", query.ownerId);
  }

  (query.accountIds ?? []).forEach((id) => params.append("accountId", id));
  (query.creditCardIds ?? []).forEach((id) =>
    params.append("creditCardId", id),
  );

  return params;
}

export default exportParams;
