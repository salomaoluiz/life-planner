import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import LowestBalanceUIModel from "./LowestBalanceUIModel";

const now = new Date(2026, 10, 12, 10);
const accounts = [
  {
    icon: "bank",
    id: "a1",
    name: "Checking",
    owner: OwnerType.USER,
    ownerId: "o1",
  },
  {
    icon: "piggy-bank",
    id: "a2",
    name: "Savings",
    owner: OwnerType.USER,
    ownerId: "o1",
  },
];

function day(date: string, a1: number, a2: number) {
  return {
    accounts: [
      { accountId: "a1", balanceCents: a1 },
      { accountId: "a2", balanceCents: a2 },
    ],
    cardsDueCents: 0,
    date,
    projected: false,
    totalCents: a1 + a2,
  };
}
function month(name: string, days: ReturnType<typeof day>[], list = accounts) {
  return new DailyBalanceDTO({ accounts: list, days, month: name });
}

it("SHOULD pick the lowest day from today on this month and the lowest of the whole next month", () => {
  const model = new LowestBalanceUIModel(
    month("2026-11", [
      day("2026-11-03", -50000, 0),
      day("2026-11-25", 100000, 21030),
      day("2026-11-28", 150000, 0),
    ]),
    month("2026-12", [day("2026-12-10", -118000, 84000)]),
    now,
    "en-US",
  );

  expect(
    model.tiles.map((tile) => [tile.id, tile.day, tile.totalCents]),
  ).toEqual([
    ["current", 25, 121030],
    ["next", 10, -34000],
  ]);
  expect(model.tiles[1].isNegative).toBe(true);
  expect(model.tiles[1].monthName).toBe("December");
  expect(model.tiles[1].lines).toEqual([
    {
      accountId: "a1",
      balanceCents: -118000,
      favorite: false,
      icon: "bank",
      name: "Checking",
    },
    {
      accountId: "a2",
      balanceCents: 84000,
      favorite: false,
      icon: "piggy-bank",
      name: "Savings",
    },
  ]);
});

it("SHOULD show only today WHEN today is the last day of the month", () => {
  const model = new LowestBalanceUIModel(
    month("2026-11", [day("2026-11-12", 10, 0)]),
    month("2026-12", []),
    now,
    "en-US",
  );

  expect(model.tiles).toHaveLength(1);
  expect(model.tiles[0].day).toBe(12);
});

it("SHOULD have no tiles and no accounts WHEN the filter has no active account", () => {
  const model = new LowestBalanceUIModel(
    month("2026-11", [], []),
    month("2026-12", [], []),
    now,
    "en-US",
  );

  expect(model.hasAccounts).toBe(false);
  expect(model.tiles).toEqual([]);
});

describe("favorite account (spec 094 FR 29)", () => {
  const favorite = { id: "a2", name: "Savings" };
  const model = new LowestBalanceUIModel(
    month("2026-11", [
      day("2026-11-03", 0, -5000),
      day("2026-11-14", 100000, 20000),
      day("2026-11-25", -300000, 80000),
    ]),
    month("2026-12", [
      day("2026-12-10", -118000, 84000),
      day("2026-12-20", 0, 1000),
    ]),
    now,
    "en-US",
    favorite,
  );

  it("SHOULD pick the lowest day of the FAVORITE, not of the total", () => {
    const [current, next] = model.tiles;

    // From today (12 Nov): the favorite is lowest at 20000 on the 14th, while the total is lowest on the 25th.
    expect(current).toMatchObject({ day: 14, totalCents: 20000 });
    expect(current.isNegative).toBe(false);
    expect(next).toMatchObject({ day: 20, totalCents: 1000 });
  });

  it("SHOULD list the favorite first and keep the total of the filter for that day", () => {
    const [current] = model.tiles;

    expect(current.lines.map((line) => line.accountId)).toEqual(["a2", "a1"]);
    expect(current.lines[0]).toMatchObject({ favorite: true });
    expect(current.lines[1]).toMatchObject({ favorite: false });
    expect(current.filterTotalCents).toBe(120000);
    expect(model.favoriteName).toBe("Savings");
  });

  it("SHOULD flag a negative favorite day", () => {
    const negative = new LowestBalanceUIModel(
      month("2026-11", [day("2026-11-20", 500000, -51960)]),
      month("2026-12", [day("2026-12-10", 1, 1)]),
      now,
      "en-US",
      favorite,
    );

    expect(negative.tiles[0]).toMatchObject({
      isNegative: true,
      totalCents: -51960,
    });
  });

  it("SHOULD behave as before WHEN there is no favorite", () => {
    const plain = new LowestBalanceUIModel(
      month("2026-11", [day("2026-11-25", 100000, 21030)]),
      month("2026-12", [day("2026-12-10", 1, 1)]),
      now,
      "en-US",
    );

    expect(plain.favoriteName).toBeUndefined();
    expect(plain.tiles[0].lines.every((line) => !line.favorite)).toBe(true);
    expect(plain.tiles[0].totalCents).toBe(121030);
  });
});
