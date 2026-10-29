import {
  ApiBusinessError,
  ConnectivityError,
  FieldInvalid,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import getBalanceSeries from "./getBalanceSeries";
import getSummary from "./getSummary";
import getTotals from "./getTotals";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

const base = {
  currency: "BRL",
  filter: {
    accountIds: ["a1"],
    categoryIds: ["c1"],
    from: "2020-01-01",
    paid: true,
    q: " market ",
    tagIds: ["t1"],
    to: "2020-02-01",
  },
  from: "2025-11-01",
  ownerIds: ["o1", "o2"],
  source: "ACCOUNT" as const,
  to: "2026-10-31",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 9, 15, 12, 0, 0) });
});
afterEach(() => jest.useRealTimers());

function queryOf(): URLSearchParams {
  const url = jest.mocked(api.get).mock.calls[0][0] as string;

  return new URLSearchParams(url.split("?")[1]);
}

it("SHOULD GET the summary with the period, owners, source and filters (never the filter period)", async () => {
  jest.mocked(api.get).mockResolvedValueOnce({
    balance: { current: 10, previous: 5, projectedEnd: 12 },
    currencies: [{ accounts: 1, cards: 0, code: "BRL" }],
    currency: "BRL",
    expense: { previous: 3, projected: 1, realized: 2 },
    income: { previous: 0, projected: 0, realized: 9 },
  });

  const result = await getSummary(base);

  expect(jest.mocked(api.get).mock.calls[0][0]).toContain(
    "/v1/finance/dashboard/summary?",
  );
  const query = queryOf();

  expect(query.get("from")).toBe("2025-11-01");
  expect(query.get("to")).toBe("2026-10-31");
  expect(query.get("today")).toBe("2026-10-15");
  expect(query.getAll("ownerId")).toEqual(["o1", "o2"]);
  expect(query.get("source")).toBe("ACCOUNT");
  expect(query.getAll("accountId")).toEqual(["a1"]);
  expect(query.getAll("categoryId")).toEqual(["c1"]);
  expect(query.getAll("tagId")).toEqual(["t1"]);
  expect(query.get("paid")).toBe("true");
  expect(query.get("q")).toBe("market");
  expect(result.expense).toEqual({ previous: 3, projected: 1, realized: 2 });
  expect(result.balance).toEqual({
    current: 10,
    previous: 5,
    projectedEnd: 12,
  });
});

it("SHOULD GET the balance series with the granularity", async () => {
  jest.mocked(api.get).mockResolvedValueOnce({
    currency: "BRL",
    granularity: "MONTH",
    points: [
      {
        accounts: [{ balance: 5, id: "a1", name: "Checking" }],
        balance: 5,
        end: "2025-11-30",
        projected: false,
        start: "2025-11-01",
      },
    ],
  });

  const result = await getBalanceSeries({ ...base, granularity: "MONTH" });

  expect(jest.mocked(api.get).mock.calls[0][0]).toContain("/balance-series?");
  expect(queryOf().get("granularity")).toBe("MONTH");
  expect(result.points[0].accounts[0].name).toBe("Checking");
});

it("SHOULD GET the totals of a period, a category and a tag", async () => {
  jest.mocked(api.get).mockResolvedValueOnce({
    bucket: "MONTH",
    groupBy: "PERIOD",
    items: [
      {
        end: "2025-11-30",
        expense: { projected: 0, realized: 4 },
        income: { projected: 0, realized: 8 },
        start: "2025-11-01",
      },
    ],
  });

  const period = await getTotals({ ...base, groupBy: "PERIOD" });

  expect(period).toMatchObject({ bucket: "MONTH", groupBy: "PERIOD" });

  jest.mocked(api.get).mockClear();
  jest.mocked(api.get).mockResolvedValueOnce({
    groupBy: "CATEGORY",
    items: [
      {
        archived: true,
        categoryId: "c1",
        count: 2,
        hasChildren: true,
        name: "Housing",
        projected: 0,
        realized: 100,
        self: false,
      },
    ],
    total: 100,
  });

  const category = await getTotals({
    ...base,
    groupBy: "CATEGORY",
    parentId: "p1",
    type: "EXPENSE",
  });
  const query = queryOf();

  expect(query.get("groupBy")).toBe("CATEGORY");
  expect(query.get("type")).toBe("EXPENSE");
  expect(query.get("parentId")).toBe("p1");
  expect(category).toMatchObject({ groupBy: "CATEGORY", total: 100 });

  jest.mocked(api.get).mockResolvedValueOnce({
    groupBy: "TAG",
    items: [
      { count: 1, name: "fixed", projected: 0, realized: 50, tagId: "t1" },
    ],
    total: 80,
    untagged: { count: 1, projected: 0, realized: 30 },
  });

  expect(
    await getTotals({ ...base, groupBy: "TAG", type: "INCOME" }),
  ).toMatchObject({
    groupBy: "TAG",
    untagged: { count: 1, realized: 30 },
  });
});

it("SHOULD map a 400 to FieldInvalid AND re-throw connectivity errors", async () => {
  jest
    .mocked(api.get)
    .mockRejectedValueOnce(
      new ApiBusinessError("Granularity not allowed", 400),
    );

  await expect(
    getBalanceSeries({ ...base, granularity: "DAY" }),
  ).rejects.toBeInstanceOf(FieldInvalid);

  const error = new ConnectivityError();

  jest.mocked(api.get).mockRejectedValueOnce(error);
  await expect(getSummary(base)).rejects.toBe(error);
});

it("SHOULD read a null or missing projected end as null (older API)", async () => {
  jest
    .mocked(api.get)
    .mockResolvedValueOnce({
      balance: { current: 1, previous: 0, projectedEnd: null },
    })
    .mockResolvedValueOnce({ balance: { current: 1, previous: 0 } });

  expect((await getSummary(base)).balance.projectedEnd).toBeNull();
  expect((await getSummary(base)).balance.projectedEnd).toBeNull();
});
