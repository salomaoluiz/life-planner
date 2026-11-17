import StockListUIModel, { StockFilters } from "./StockListUIModel";
import {
  dto,
  expired,
  expiring,
  familyItem,
  fine,
  low,
  owners,
} from "./stockUi.fixtures";

const base = { filter: "ALL", search: "", sort: "EXPIRATION" as const };
function ids(rows: Array<{ id: string }>) {
  return rows.map((row) => row.id);
}
function model(
  items = [fine("fine"), expired("exp"), low("low"), expiring("soon")],
) {
  return new StockListUIModel(items, owners, "en-US");
}

describe("grouping and sorting", () => {
  it("SHOULD group attention first (by nearest expiration, dated before undated) and the rest after", () => {
    const rows = model().view(base).rows;

    expect(ids(rows)).toEqual([
      "header-attention",
      "exp",
      "soon",
      "low",
      "header-ok",
      "fine",
    ]);
  });

  it("SHOULD omit an empty group", () => {
    expect(ids(model([fine("a")]).view(base).rows)).toEqual(["header-ok", "a"]);
    expect(ids(model([expired("a")]).view(base).rows)).toEqual([
      "header-attention",
      "a",
    ]);
  });

  it("SHOULD sort by name and by recent without groups", () => {
    const items = [
      dto((f) =>
        f
          .withId("b")
          .withDescription("Banana")
          .withCreatedAt(new Date(2026, 0, 1)),
      ),
      dto((f) =>
        f
          .withId("a")
          .withDescription("apple")
          .withCreatedAt(new Date(2026, 0, 2)),
      ),
      dto((f) => f.withId("c").withDescription("Cherry")),
    ];

    expect(ids(model(items).view({ ...base, sort: "NAME" }).rows)).toEqual([
      "a",
      "b",
      "c",
    ]);
    expect(ids(model(items).view({ ...base, sort: "RECENT" }).rows)).toEqual([
      "a",
      "b",
      "c",
    ]);
  });

  it("SHOULD break ties by description", () => {
    const same = new Date(2026, 9, 8);
    const items = [
      dto((f) =>
        f.withId("b").withDescription("B").withNearestExpiration(same),
      ),
      dto((f) =>
        f.withId("a").withDescription("A").withNearestExpiration(same),
      ),
    ];

    expect(ids(model(items).view(base).rows)).toEqual(["header-ok", "a", "b"]);
  });
});

describe("counters", () => {
  it("SHOULD count attention and total WITHOUT the archived families", () => {
    const list = model([
      expired("a"),
      low("b"),
      fine("c"),
      { ...familyItem("old", "family-2"), needsRestock: true } as never,
    ]);

    expect(list.total).toBe(3);
    expect(list.attentionCount).toBe(2);
  });
});

describe("filters", () => {
  it("SHOULD count the filters, with expiring including expired", () => {
    const options = model().view(base).filterOptions;

    expect(options.find((o) => o.value === StockFilters.ALL)?.count).toBe(4);
    expect(options.find((o) => o.value === StockFilters.EXPIRING)?.count).toBe(
      2,
    );
    expect(options.find((o) => o.value === StockFilters.EXPIRED)?.count).toBe(
      1,
    );
  });

  it("SHOULD filter expired, expiring, personal and one family", () => {
    const items = [expired("e"), expiring("x"), familyItem("f")];
    const list = model(items);

    expect(
      ids(list.view({ ...base, filter: StockFilters.EXPIRED }).rows),
    ).toEqual(["header-attention", "e"]);
    expect(
      ids(list.view({ ...base, filter: StockFilters.EXPIRING }).rows),
    ).toEqual(["header-attention", "e", "x"]);
    expect(
      ids(list.view({ ...base, filter: StockFilters.PERSONAL }).rows).filter(
        (id) => id === "f",
      ),
    ).toEqual([]);
    expect(ids(list.view({ ...base, filter: "family-1" }).rows)).toEqual([
      "header-ok",
      "f",
    ]);
  });

  it("SHOULD list personal, active families and then archived ones", () => {
    const options = model().view(base).filterOptions;

    expect(options.slice(3).map((option) => option.value)).toEqual([
      StockFilters.PERSONAL,
      "family-1",
      "family-2",
    ]);
    expect(options[options.length - 1].archived).toBe(true);
  });

  it("SHOULD fall back to ALL for an unknown filter and leave archived items out of scope filters", () => {
    const list = model([familyItem("old", "family-2"), fine("a")]);

    expect(list.view({ ...base, filter: "ghost" }).activeFilter).toBe(
      StockFilters.ALL,
    );
    expect(ids(list.view(base).rows)).toEqual(["header-ok", "a"]);
    expect(ids(list.view({ ...base, filter: "family-2" }).rows)).toEqual([
      "header-ok",
      "old",
    ]);
  });
});

describe("search, category and location", () => {
  it("SHOULD search by name, brand and barcode ignoring accents", () => {
    const items = [
      dto((f) => f.withId("a").withDescription("Muçarela")),
      dto((f) => f.withId("b").withDescription("Rice").withBrand("Tio João")),
      dto((f) => f.withId("c").withDescription("Salt").withBarcode("12345")),
    ];
    const list = model(items);

    expect(ids(list.view({ ...base, search: "mucar" }).rows)).toEqual([
      "header-ok",
      "a",
    ]);
    expect(ids(list.view({ ...base, search: "joao" }).rows)).toEqual([
      "header-ok",
      "b",
    ]);
    expect(ids(list.view({ ...base, search: "123" }).rows)).toEqual([
      "header-ok",
      "c",
    ]);
    expect(list.view({ ...base, search: "zzz" }).hasNoResults).toBe(true);
  });

  it("SHOULD filter by the categories and locations chosen (an empty choice filters nothing)", () => {
    const items = [
      dto((f) =>
        f
          .withId("a")
          .withCategory({ archived: false, id: "c1", name: "A", path: "A" })
          .withLocation({ archived: false, id: "l1", name: "L" }),
      ),
      dto((f) =>
        f
          .withId("b")
          .withCategory({ archived: false, id: "c2", name: "B", path: "B" }),
      ),
      dto((f) => f.withId("c")),
    ];
    const list = model(items);

    expect(
      ids(list.view({ ...base, categoryIds: new Set(["c1", "c2"]) }).rows),
    ).toEqual(["header-ok", "a", "b"]);
    expect(
      ids(list.view({ ...base, locationIds: new Set(["l1"]) }).rows),
    ).toEqual(["header-ok", "a"]);
    expect(
      ids(
        list.view({ ...base, categoryIds: new Set(), locationIds: new Set() })
          .rows,
      ),
    ).toEqual(["header-ok", "a", "b", "c"]);
  });
});
