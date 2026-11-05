import limitBar from "./limitBar";

it("SHOULD split the limit in consumed, projected and available (spec 096 artifact: 39% / 6.4%)", () => {
  const bar = limitBar({
    limit: 800000,
    projectedUsed: 51240,
    used: 312050,
  });

  expect(bar.consumedPct).toBeCloseTo(39, 1);
  expect(bar.projectedPct).toBeCloseTo(6.4, 1);
  expect(bar.availableCents).toBe(436710);
});

it("SHOULD clamp the bar to 100% AND keep a negative available WHEN over the limit", () => {
  const bar = limitBar({ limit: 100000, projectedUsed: 30000, used: 90000 });

  expect(bar.consumedPct).toBe(90);
  expect(bar.projectedPct).toBe(10);
  expect(bar.availableCents).toBe(-20000);
});

it("SHOULD give an empty bar WHEN the card has no limit", () => {
  expect(limitBar({ limit: 0, projectedUsed: 100, used: 100 })).toEqual({
    availableCents: -200,
    consumedPct: 0,
    projectedPct: 0,
  });
});
