import ShoppingListSummaryUIModel from "./ShoppingListSummaryUIModel";

const dto = {
  count: 7,
  groups: [
    {
      list: { id: "m", name: "Mercado", owner: "FAMILY", ownerName: "Casa" },
      rows: [
        { description: "Milk", quantity: 6, unit: "unit" as never },
        { description: "Cheese", quantity: 0.5, unit: "kilogram" as never },
      ],
    },
    {
      list: { id: "p", name: "Farmácia", owner: "USER" },
      rows: [{ description: "Soap", quantity: 1, unit: "unit" as never }],
    },
  ],
  totals: [{ currency: "BRL", estimatedTotalCents: 9420, pricedCount: 6 }],
};

it("SHOULD title family lists with the family and personal ones with the list name", () => {
  const model = new ShoppingListSummaryUIModel(dto, "en-US");

  expect(model.groups.map((group) => group.title)).toEqual([
    "Mercado · Casa",
    "Farmácia",
  ]);
  expect(model.count).toBe(7);
  expect(model.totals).toHaveLength(1);
});

it("SHOULD format quantities (g below 1 kg) and count what is left out of the card", () => {
  const model = new ShoppingListSummaryUIModel(dto, "en-US");

  expect(model.groups[0].rows[1]).toMatchObject({
    quantityText: "500",
    unitKey: "common.units.gram",
  });
  expect(model.remaining).toBe(4);
  expect(model.isEmpty).toBe(false);
});

it("SHOULD be empty without rows and never report a negative remainder", () => {
  const empty = new ShoppingListSummaryUIModel(
    { count: 0, groups: [], totals: [] },
    "en-US",
  );

  expect(empty.isEmpty).toBe(true);
  expect(empty.remaining).toBe(0);
});
