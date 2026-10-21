import { columnsOf } from "./mapping";
import { ColumnMapping } from "./types";

// The keys of the value maps (see `ValueMaps`).
function accountKey(ownerId: string, value: string): string {
  return `${ownerId}|${value}`;
}

function categoryKey(ownerId: string, type: string, value: string): string {
  return `${ownerId}|${type}|${value}`;
}

// Spec 047: the owner of a row is the one its "Belongs to" cell was matched to; empty cells and files without the
// column take the owner chosen in step 1.
function ownerOfRow(
  row: string[],
  mapping: ColumnMapping,
  ownerMap: Record<string, string>,
  defaultOwnerId: string,
): string {
  const [column] = columnsOf(mapping, "owner");
  const text = column === undefined ? "" : (row[column] ?? "").trim();

  return text === "" ? defaultOwnerId : (ownerMap[text] ?? defaultOwnerId);
}

export { accountKey, categoryKey, ownerOfRow };
