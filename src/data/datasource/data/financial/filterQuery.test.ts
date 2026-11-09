import appendFilterParams from "./filterQuery";

describe("appendFilterParams", () => {
  const filter = {
    accountIds: ["a1"],
    categoryIds: ["c1", "c2"],
    creditCardIds: ["k1"],
    from: "2025-01-01",
    paid: false,
    q: " mercado ",
    tagIds: ["t1"],
    to: "2025-12-31",
  };

  it("SHOULD add repeatable ids, the period, paid and the trimmed search", () => {
    const query = new URLSearchParams();

    appendFilterParams(query, filter, [
      "accountIds",
      "categoryIds",
      "creditCardIds",
      "from",
      "paid",
      "q",
      "tagIds",
    ]);

    expect(query.toString()).toBe(
      "accountId=a1&categoryId=c1&categoryId=c2&creditCardId=k1&tagId=t1&from=2025-01-01&to=2025-12-31&paid=false&q=mercado",
    );
  });

  it("SHOULD add only the keys the endpoint understands", () => {
    const query = new URLSearchParams();

    appendFilterParams(query, filter, ["q", "categoryIds"]);

    expect(query.toString()).toBe("categoryId=c1&categoryId=c2&q=mercado");
  });

  it("SHOULD skip a missing filter, a lone from and a blank search", () => {
    const query = new URLSearchParams();

    appendFilterParams(query, undefined, ["q"]);
    appendFilterParams(query, { from: "2025-01-01", q: "  " }, ["from", "q"]);

    expect(query.toString()).toBe("");
  });
});

describe("kind filter (spec 098)", () => {
  it("SHOULD append kind=TRANSFER only when the endpoint understands it", () => {
    const allowed = new URLSearchParams();
    const denied = new URLSearchParams();

    appendFilterParams(allowed, { kind: "TRANSFER" }, ["kind"]);
    appendFilterParams(denied, { kind: "TRANSFER" }, ["q"]);

    expect(allowed.toString()).toBe("kind=TRANSFER");
    expect(denied.toString()).toBe("");
  });
});
