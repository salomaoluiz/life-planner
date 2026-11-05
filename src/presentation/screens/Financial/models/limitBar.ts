export interface LimitBar {
  // Negative WHEN the card is over its limit (cents).
  availableCents: number;
  consumedPct: number;
  projectedPct: number;
}

interface Params {
  // Cents.
  limit: number;
  projectedUsed: number;
  used: number;
}

// Spec 096 FR 16: one bar with consumed (solid), projected (hatched) and available (empty). The two filled parts
// never pass 100% together, so an over-limit card shows a full bar.
function limitBar({ limit, projectedUsed, used }: Params): LimitBar {
  const availableCents = limit - used - projectedUsed;

  if (limit <= 0) {
    return { availableCents, consumedPct: 0, projectedPct: 0 };
  }

  const consumedPct = Math.min(100, (Math.max(0, used) / limit) * 100);
  const projectedPct = Math.min(
    100 - consumedPct,
    (Math.max(0, projectedUsed) / limit) * 100,
  );

  return { availableCents, consumedPct, projectedPct };
}

export default limitBar;
