import { normalizeText } from "./suggestColumns";
import { RowType } from "./types";

interface TransferCategory {
  // The fixed id the API seeds for the system category (it is not in the category lists).
  id: string;
  key: TransferCategoryKey;
  // The names it goes by in a file: the 047 export in both languages.
  names: string[];
  type: RowType;
}

type TransferCategoryKey = "TRANSFER_FEE" | "TRANSFER_IN" | "TRANSFER_OUT";

// Spec 098 FR 12: the system categories of the rows of a transfer, matched by the name the export writes.
const TRANSFER_CATEGORIES: TransferCategory[] = [
  {
    id: "00000000-0000-4000-8000-000000000006",
    key: "TRANSFER_OUT",
    names: ["Transfer out", "Transferência enviada"],
    type: "EXPENSE",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    key: "TRANSFER_IN",
    names: ["Transfer in", "Transferência recebida"],
    type: "INCOME",
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    key: "TRANSFER_FEE",
    names: ["Transfer fees", "Tarifas de transferência"],
    type: "EXPENSE",
  },
];

// The id of the transfer category a file value names, for the rows of that type.
function matchTransferCategory(
  value: string,
  type: RowType,
): string | undefined {
  const wanted = normalizeText(value);

  return TRANSFER_CATEGORIES.find(
    (item) =>
      item.type === type &&
      item.names.some((name) => normalizeText(name) === wanted),
  )?.id;
}

function transferKeyOf(categoryId: string): TransferCategoryKey | undefined {
  return TRANSFER_CATEGORIES.find((item) => item.id === categoryId)?.key;
}

export type { TransferCategory, TransferCategoryKey };
export { matchTransferCategory, TRANSFER_CATEGORIES, transferKeyOf };
