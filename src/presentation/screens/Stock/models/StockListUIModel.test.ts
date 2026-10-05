import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import StockListUIModel, { StockSort } from "./StockListUIModel";

const now = new Date(2026, 9, 5, 12);
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({
    id: "family-id",
    name: "Test Family",
    type: OwnerType.FAMILY,
  }),
];

function day(offset: number) {
  return new Date(2026, 9, 5 + offset);
}

function dto(
  id: string,
  description: string,
  params: Partial<ConstructorParameters<typeof StockDTO>[0]> = {},
) {
  const isFamily = params.owner === StockOwners.FAMILY;

  return new StockDTO({
    description,
    id,
    owner: StockOwners.USER,
    ownerId: isFamily ? "family-id" : "user-id",
    quantity: 1,
    unit: StockUnits.UNIT,
    ...params,
  });
}

function fixture() {
  return [
    dto("milk", "Leite integral", {
      brand: "Italac",
      expirationDate: day(2),
    }),
    dto("powder", "Leite em pó", {
      expirationDate: day(30),
      owner: StockOwners.FAMILY,
    }),
    dto("rice", "Arroz", { expirationDate: day(-3) }),
    dto("beans", "Feijão", {
      openingDate: day(-1),
      owner: StockOwners.FAMILY,
    }),
    dto("sugar", "Açúcar", {
      createdAt: new Date(2026, 8, 1),
      expirationDate: day(-10),
    }),
    dto("coffee", "Café", {
      createdAt: new Date(2026, 9, 1),
      expirationDate: day(20),
    }),
    dto("zebra", "Zebra Item"),
  ];
}

function ids(
  params: { filter?: string; search?: string; sort?: StockSort },
  list = model(),
) {
  return list
    .view({ filter: "ALL", search: "", sort: "EXPIRATION", ...params })
    .rows.map((row) => row.id);
}

function model(dtos = fixture()) {
  return new StockListUIModel(dtos, owners, now, "en-US");
}

describe("StockListUIModel", () => {
  it("SHOULD count total and attention items", () => {
    expect(model().total).toBe(7);
    expect(model().attentionCount).toBe(3);
    expect(model().items).toHaveLength(7);
  });

  it("SHOULD group by attention then OK sorted by expiration", () => {
    expect(ids({})).toEqual([
      "header-attention",
      "sugar",
      "rice",
      "milk",
      "header-ok",
      "coffee",
      "powder",
      "beans",
      "zebra",
    ]);
  });

  it("SHOULD omit an empty section header", () => {
    expect(ids({ filter: "EXPIRED" })).toEqual([
      "header-attention",
      "sugar",
      "rice",
    ]);
  });

  it("SHOULD sort by name without headers ignoring accents", () => {
    expect(ids({ sort: "NAME" })).toEqual([
      "sugar",
      "rice",
      "coffee",
      "beans",
      "powder",
      "milk",
      "zebra",
    ]);
  });

  it("SHOULD sort by most recent with undated items last", () => {
    expect(ids({ sort: "RECENT" })).toEqual([
      "coffee",
      "sugar",
      "rice",
      "beans",
      "powder",
      "milk",
      "zebra",
    ]);
  });

  it("SHOULD search ignoring case, accents and brand", () => {
    expect(ids({ search: "lei" })).toEqual([
      "header-attention",
      "milk",
      "header-ok",
      "powder",
    ]);
    expect(ids({ search: "LEI" })).toEqual(ids({ search: "lei" }));
    expect(ids({ search: "acucar" })).toEqual(["header-attention", "sugar"]);
    expect(ids({ search: "italac" })).toEqual(["header-attention", "milk"]);
  });

  it("SHOULD treat a blank search as empty", () => {
    expect(ids({ search: "   " })).toEqual(ids({}));
  });

  it("SHOULD make the Expiring filter include expired items", () => {
    expect(ids({ filter: "EXPIRING" })).toEqual([
      "header-attention",
      "sugar",
      "rice",
      "milk",
    ]);
  });

  it("SHOULD filter by personal and by family", () => {
    expect(ids({ filter: "PERSONAL", sort: "NAME" })).toEqual([
      "sugar",
      "rice",
      "coffee",
      "milk",
      "zebra",
    ]);
    expect(ids({ filter: "family-id", sort: "NAME" })).toEqual([
      "beans",
      "powder",
    ]);
  });

  it("SHOULD fall back to ALL for an unknown filter", () => {
    const view = model().view({
      filter: "gone-id",
      search: "",
      sort: "NAME",
    });

    expect(view.activeFilter).toBe("ALL");
    expect(view.rows).toHaveLength(7);
  });

  it("SHOULD build the filter options with counts", () => {
    const { filterOptions } = model().view({
      filter: "ALL",
      search: "",
      sort: "NAME",
    });

    expect(filterOptions).toEqual([
      { count: 7, labelKey: "stock.list.filter.all", value: "ALL" },
      { count: 3, labelKey: "stock.list.filter.expiring", value: "EXPIRING" },
      { count: 2, labelKey: "stock.list.filter.expired", value: "EXPIRED" },
      { labelKey: "stock.list.filter.personal", value: "PERSONAL" },
      { label: "Test Family", value: "family-id" },
    ]);
  });

  it("SHOULD make the counts follow the search text", () => {
    const { filterOptions } = model().view({
      filter: "ALL",
      search: "leite",
      sort: "NAME",
    });

    expect(filterOptions.slice(0, 3).map((option) => option.count)).toEqual([
      2, 1, 0,
    ]);
  });

  it("SHOULD report no results only when items exist", () => {
    expect(
      model().view({ filter: "ALL", search: "zzz", sort: "NAME" }).hasNoResults,
    ).toBe(true);

    const empty = model([]).view({ filter: "ALL", search: "", sort: "NAME" });

    expect(empty.hasNoResults).toBe(false);
    expect(empty.rows).toEqual([]);
  });

  it("SHOULD break expiration ties by description", () => {
    const list = model([
      dto("b", "Bravo", { expirationDate: day(20) }),
      dto("a", "Alpha", { expirationDate: day(20) }),
    ]);

    expect(ids({}, list)).toEqual(["header-ok", "a", "b"]);
  });
});
