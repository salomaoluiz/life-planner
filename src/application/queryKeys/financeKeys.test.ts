import { financeKeys } from "./financeKeys";

function startsWith(key: string[], prefix: string[]) {
  return prefix.every((part, index) => key[index] === part);
}

describe("financeKeys", () => {
  it("SHOULD nest a month list under the prefix of every month list", () => {
    expect(
      startsWith(
        financeKeys.transactions.list("2026-11"),
        financeKeys.transactions.list(),
      ),
    ).toBe(true);
  });

  it("SHOULD keep the forms' raw use-case output apart from the composed list shape", () => {
    expect(
      startsWith(
        financeKeys.transactions.list("2026-11"),
        financeKeys.transactions.raw(),
      ),
    ).toBe(false);
    expect(
      startsWith(
        financeKeys.transactions.raw(),
        financeKeys.transactions.list(),
      ),
    ).toBe(false);
    expect(
      startsWith(
        financeKeys.transactions.raw(),
        financeKeys.transactions.all(),
      ),
    ).toBe(true);
  });

  it.each(["screen", "home"] as const)(
    "SHOULD select the %s balances and summary of a month by the month prefix",
    (scope) => {
      expect(
        startsWith(
          financeKeys.dailyBalances.ofMonth("2026-11", scope, "owner-1"),
          financeKeys.dailyBalances.monthPrefix("2026-11"),
        ),
      ).toBe(true);
      expect(
        startsWith(
          financeKeys.summary.ofMonth("2026-11", scope, "owner-1"),
          financeKeys.summary.monthPrefix("2026-11"),
        ),
      ).toBe(true);
      expect(
        startsWith(
          financeKeys.summary.ofMonth("2026-10", scope),
          financeKeys.summary.monthPrefix("2026-11"),
        ),
      ).toBe(false);
    },
  );

  it("SHOULD list the 14 prefixes the finance invalidation clears, all under the finance root", () => {
    const roots = financeKeys.invalidationRoots();

    expect(roots).toHaveLength(14);
    roots.forEach((root) =>
      expect(startsWith(root, financeKeys.all())).toBe(true),
    );
  });
});
