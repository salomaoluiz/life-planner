import { largeAccountRows } from "../../tests/perf/fixtures/finance";
import respond from "../../tests/perf/respond";

describe("perf fixtures", () => {
  it("SHOULD build 5000 rows with unique ids for the large account", () => {
    const rows = largeAccountRows(5000);

    expect(rows).toHaveLength(5000);
    expect(new Set(rows.map((row) => row.id)).size).toBe(5000);
  });

  it("SHOULD answer /v1/user/me with a fake user", () => {
    expect(respond("GET", "/v1/user/me")).toMatchObject({
      email: "test@example.com",
    });
  });

  it("SHOULD return the whole history WHEN the transactions GET has no period", () => {
    expect(
      (respond("GET", "/v1/finance/transactions") as { items: unknown[] })
        .items,
    ).toHaveLength(5000);
  });

  it("SHOULD return the month rows WHEN from= is present", () => {
    expect(
      (
        respond("GET", "/v1/finance/transactions?from=2025-01-01") as {
          items: unknown[];
        }
      ).items.length,
    ).toBeLessThan(10);
  });
});
