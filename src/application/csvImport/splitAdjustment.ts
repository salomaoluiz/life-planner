import { normalizeText } from "./suggestColumns";

// The fixed id the API seeds for the system category "Desconto/ajuste" (spec 119 FR 10); it is not in the category lists.
const SPLIT_ADJUSTMENT_ID = "00000000-0000-4000-8000-00000000000b";

// The names the 047 export writes for it, in both languages.
const SPLIT_ADJUSTMENT_NAMES = ["Discount/adjustment", "Desconto/ajuste"];

function isSplitAdjustmentName(value: string): boolean {
  const wanted = normalizeText(value);

  return SPLIT_ADJUSTMENT_NAMES.some((name) => normalizeText(name) === wanted);
}

export { isSplitAdjustmentName, SPLIT_ADJUSTMENT_ID };
