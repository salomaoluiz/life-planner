import toEvolutionSeries from "./seriesModel";

const series = [
  { date: "2025-12-31", invested: null, marketValue: null },
  { date: "2026-01-31", invested: null, marketValue: null },
  { date: "2026-03-31", invested: 100_000, marketValue: 100_000 },
  { date: "2026-06-30", invested: 100_000, marketValue: 120_000 },
];

it("SHOULD keep a bucket before the first operation as a gap, never as zero", () => {
  const { invested, market } = toEvolutionSeries(series, "MONTH", "pt-BR");

  expect(market.map((point) => point.value)).toEqual([
    undefined,
    undefined,
    100_000,
    120_000,
  ]);
  expect(invested.map((point) => point.value)).toEqual([
    undefined,
    undefined,
    100_000,
    100_000,
  ]);
});

it("SHOULD label each point by the month of its last day AND never project", () => {
  const { market } = toEvolutionSeries(series, "MONTH", "pt-BR");

  expect(market.map((point) => point.label)).toEqual([
    "dez",
    "jan",
    "mar",
    "jun",
  ]);
  expect(market.every((point) => point.projected === false)).toBe(true);
});

it("SHOULD label weeks with their last day AND days with the day number", () => {
  const week = toEvolutionSeries(
    [{ date: "2026-11-08", invested: 1, marketValue: 1 }],
    "WEEK",
    "pt-BR",
  );
  const day = toEvolutionSeries(
    [{ date: "2026-11-04", invested: 1, marketValue: 1 }],
    "DAY",
    "pt-BR",
  );

  expect(week.market[0].label).toBe("8 de nov");
  expect(day.market[0].label).toBe("4");
});

it("SHOULD tell where the position starts, or that there is none", () => {
  expect(toEvolutionSeries(series, "MONTH", "pt-BR").firstFilled).toBe(2);
  expect(
    toEvolutionSeries(
      [{ date: "2026-01-31", invested: null, marketValue: null }],
      "MONTH",
      "pt-BR",
    ).firstFilled,
  ).toBeUndefined();
});
