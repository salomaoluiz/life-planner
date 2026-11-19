import { makePart, makeSplit } from "../mocks/split.mocks";
import SplitUIModel from "./SplitUIModel";

it("SHOULD sum the net of the parts (120 + 50 - 4,40 = 165,60 expense) AND take the header from the split lookup", () => {
  const split = makeSplit();

  expect(split.signedCents).toBe(-16560);
  expect(split.isExpense).toBe(true);
  expect(split.totalCents).toBe(16560);
  expect(split.description).toBe("Mercado Bom Preço");
  expect(split.partCount).toBe(3);
  expect(split.matchedCount).toBe(3);
  expect(split.isFiltered).toBe(false);
  expect(split.othersCount).toBe(0);
  expect(split.othersCents).toBe(0);
  expect(split.accountName).toBe("Checking");
  expect(split.dateKey).toBe("2026-11-15");
  expect(split.isProjected).toBe(false);
});

it("SHOULD list the parts in the order the user wrote them with the adjustment as a negative amount", () => {
  const views = makeSplit().partViews;

  expect(views.map((part) => part.id)).toEqual(["p1", "p2", "p3"]);
  expect(views[0]).toEqual(
    expect.objectContaining({
      amountCents: 12000,
      inherited: true,
      isAdjustment: false,
    }),
  );
  expect(views[1]).toEqual(
    expect.objectContaining({
      description: "Detergente",
      inherited: false,
      tags: ["casa"],
    }),
  );
  expect(views[2]).toEqual(
    expect.objectContaining({ amountCents: -440, isAdjustment: true }),
  );
});

it("SHOULD be a filtered share WHEN fewer parts than the split has match (spec 119 FR 28)", () => {
  const split = new SplitUIModel("split-1", [
    makePart("p2", 1, "50.00", {
      split: {
        description: "Mercado",
        matchedCount: 1,
        matchedTotal: "50.00",
        partCount: 6,
        total: "280.00",
        type: "EXPENSE",
      },
    }),
  ]);

  expect(split.isFiltered).toBe(true);
  expect(split.matchedCount).toBe(1);
  expect(split.partCount).toBe(6);
  expect(split.totalCents).toBe(28000);
  expect(split.othersCount).toBe(5);
  expect(split.othersCents).toBe(23000);
});

it("SHOULD be an income WHEN the income parts outweigh the expenses AND fall back to the rows without a lookup", () => {
  const split = new SplitUIModel("split-2", [
    makePart("a", 0, "950.00", { split: undefined, type: "INCOME" }),
    makePart("b", 1, "100.00", { split: undefined }),
  ]);

  expect(split.isExpense).toBe(false);
  expect(split.signedCents).toBe(85000);
  expect(split.totalCents).toBe(85000);
  expect(split.partCount).toBe(2);
  expect(split.description).toBe("Mercado");
  expect(split.isPaid).toBe(true);
  expect(split.recurrenceId).toBeUndefined();
  expect(split.notes).toBeUndefined();
});
