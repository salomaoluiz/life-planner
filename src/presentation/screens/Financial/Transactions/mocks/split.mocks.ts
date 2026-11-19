import SplitUIModel from "../models/SplitUIModel";
import TransactionUIModel from "../models/TransactionUIModel";
import { makeTransactionDTO } from "./index.mocks";

function defaultParts() {
  return [
    makePart("p2", 1, "50.00", {
      description: "Detergente",
      descriptionInherited: false,
      tags: [{ id: "t1", name: "casa" }],
    }),
    makePart("p1", 0, "120.00"),
    makePart("p3", 2, "-4.40", { systemKey: "SPLIT_ADJUSTMENT" }),
  ];
}

// One part row of a split as the list receives it; `partCount` and `total` come from the split lookup.
function makePart(
  id: string,
  position: number,
  value: string,
  overrides: Record<string, unknown> = {},
) {
  return new TransactionUIModel(
    makeTransactionDTO({
      categoryName: `Category ${position}`,
      date: "2026-11-15T12:00:00.000Z",
      description: "Mercado",
      descriptionInherited: true,
      id,
      split: {
        description: "Mercado Bom Preço",
        matchedCount: 3,
        matchedTotal: "165.60",
        partCount: 3,
        total: "165.60",
        type: "EXPENSE" as never,
      },
      splitId: "split-1",
      splitPosition: position,
      value,
      ...overrides,
    } as never),
  );
}

function makeSplit(parts: TransactionUIModel[] = defaultParts()) {
  return new SplitUIModel("split-1", parts);
}

export { defaultParts, makePart, makeSplit };
