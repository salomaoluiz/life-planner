export interface FittedValue {
  fit: "compact" | "full" | "small";
  text: string;
}

export interface FitValueParams {
  compact?: string;
  full: string;
  sizes: { full: number; small: number };
  // The measured width of the value area; unknown before the first layout
  width?: number;
}

// An average digit is about 0.6 em wide in the tabular font; React Native Web has no `adjustsFontSizeToFit`.
const CHAR_EM = 0.6;

// Spec 052 FR 14: the full value at the tile size, then one size smaller, then the compact format. Never cut.
function fitValue(params: FitValueParams): FittedValue {
  const { compact, full, sizes, width } = params;

  if (width === undefined || full.length * sizes.full * CHAR_EM <= width) {
    return { fit: "full", text: full };
  }

  if (full.length * sizes.small * CHAR_EM <= width) {
    return { fit: "small", text: full };
  }

  return compact
    ? { fit: "compact", text: compact }
    : { fit: "small", text: full };
}

export default fitValue;
