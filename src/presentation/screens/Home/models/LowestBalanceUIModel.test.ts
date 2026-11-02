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
    { accountId: "a1", balanceCents: -118000, icon: "bank", name: "Checking" },
    {
      accountId: "a2",
      balanceCents: 84000,
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
