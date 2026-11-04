import { makeTransactionDTO } from "../mocks/index.mocks";
import {
  ALL_FILTER,
  buildEntries,
  filterByOwner,
  filterByType,
} from "../models/transactionList";
import TransactionUIModel from "../models/TransactionUIModel";

const MAX_RATIO = 6;

// The global jest setup installs fake timers: a benchmark needs the real clock.
beforeAll(() => {
  jest.useRealTimers();
});

// The derivation the transactions screen runs on every change: filter by scope and type, group by day, sort.
function derive(items: TransactionUIModel[]) {
  return buildEntries(
    filterByType(filterByOwner(items, ALL_FILTER), "ALL"),
    new Date(),
  );
}

function makeRows(count: number) {
  return Array.from({ length: count }, (_, index) => {
    const day = String((index % 31) + 1).padStart(2, "0");

    return new TransactionUIModel(
      makeTransactionDTO({
        date: `2026-10-${day}T12:00:00.000Z`,
        id: `tx-${index}`,
        ownerId: index % 2 === 0 ? "owner-1" : "owner-2",
        type: index % 3 === 0 ? "INCOME" : "EXPENSE",
      }),
    );
  });
}

// Median of several runs after a warm-up, floored so a coarse clock never divides by zero.
function medianMs(run: () => void, repeats = 5) {
  run();
  const samples = Array.from({ length: repeats }, () => {
    const start = performance.now();

    run();

    return performance.now() - start;
  }).sort((a, b) => a - b);

  return Math.max(samples[Math.floor(repeats / 2)], 0.01);
}

it("SHOULD group 20k rows by day into one header per day plus one entry per row", () => {
  const entries = derive(makeRows(20000));

  expect(entries.filter((entry) => entry.kind === "header")).toHaveLength(31);
  expect(entries.filter((entry) => entry.kind === "item")).toHaveLength(20000);
});

it("SHOULD derive 20k rows in less than 6x the time of 5k rows", () => {
  const small = makeRows(5000);
  const large = makeRows(20000);
  const smallMs = medianMs(() => derive(small));
  const largeMs = medianMs(() => derive(large));
  const ratio = largeMs / smallMs;

  if (process.env.PERF_REPORT) {
    process.stdout.write(
      `derive 5k ${smallMs.toFixed(1)} ms, 20k ${largeMs.toFixed(1)} ms, ratio ${ratio.toFixed(2)}\n`,
    );
  }
  expect(ratio).toBeLessThan(MAX_RATIO);
});
