import RecentTransactionDTO from "@application/dto/home/RecentTransactionDTO";

import RecentTransactionUIModel from "./RecentTransactionUIModel";

const now = new Date(2026, 9, 5, 14, 0);

function build(date: Date, type = "EXPENSE") {
  return new RecentTransactionUIModel(
    new RecentTransactionDTO({
      categoryColor: "#112233",
      categoryIcon: "cart",
      categoryName: "Groceries",
      date: date.toISOString(),
      description: "Market",
      id: "tx-1",
      type,
      value: 1250,
    }),
    now,
    "en-US",
  );
}

it("SHOULD label today and yesterday", () => {
  expect(build(new Date(2026, 9, 5)).dateKey).toBe("common.date.today");
  expect(build(new Date(2026, 9, 4)).dateKey).toBe("common.date.yesterday");
});

it("SHOULD use a short date for older transactions", () => {
  const model = build(new Date(2026, 8, 30));

  expect(model.dateKey).toBeUndefined();
  expect(model.dateText).toBe("Sep 30");

  const pt = new RecentTransactionUIModel(
    new RecentTransactionDTO({
      categoryName: "x",
      date: new Date(2026, 8, 30).toISOString(),
      description: "d",
      id: "i",
      type: "EXPENSE",
      value: 1,
    }),
    now,
    "pt-BR",
  );

  expect(pt.dateText).toBe(
    new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short" }).format(
      new Date(2026, 8, 30),
    ),
  );
});

it("SHOULD map the amount by type", () => {
  expect(build(now, "EXPENSE").amount).toEqual({
    type: "EXPENSE",
    value: 1250,
  });
  expect(build(now, "INCOME").amount).toEqual({ type: "INCOME", value: 1250 });
});

it("SHOULD pass the other fields through", () => {
  const model = build(now);

  expect(model.id).toBe("tx-1");
  expect(model.title).toBe("Market");
  expect(model.categoryName).toBe("Groceries");
  expect(model.categoryIcon).toBe("cart");
  expect(model.categoryColor).toBe("#112233");
});
