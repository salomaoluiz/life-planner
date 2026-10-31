import { ConnectivityError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import getUpcoming from "./getUpcoming";

jest.mock("@infrastructure/api", () => ({ api: { get: jest.fn() } }));

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 12, 12, 0, 0) });
});
afterEach(() => jest.useRealTimers());

function queryOf(): URLSearchParams {
  const url = jest.mocked(api.get).mock.calls[0][0] as string;

  return new URLSearchParams(url.split("?")[1]);
}

it("SHOULD GET the upcoming items with every owner, today and the window", async () => {
  jest.mocked(api.get).mockResolvedValueOnce({ next: [], overdue: [] });

  const result = await getUpcoming({
    days: 7,
    limit: 5,
    ownerIds: ["o1", "o2"],
  });

  expect(jest.mocked(api.get).mock.calls[0][0]).toContain(
    "/v1/finance/upcoming?",
  );
  expect(queryOf().getAll("ownerId")).toEqual(["o1", "o2"]);
  expect(queryOf().get("today")).toBe("2026-11-12");
  expect(queryOf().get("days")).toBe("7");
  expect(queryOf().get("limit")).toBe("5");
  expect(result.nextTotal).toBe(0);
});

it("SHOULD leave days and limit to the API defaults when not given", async () => {
  jest.mocked(api.get).mockResolvedValueOnce({});

  await getUpcoming({ ownerIds: ["o1"] });

  expect(queryOf().has("days")).toBe(false);
  expect(queryOf().has("limit")).toBe(false);
});

it("SHOULD rethrow a connectivity error", async () => {
  const error = new ConnectivityError();

  jest.mocked(api.get).mockRejectedValueOnce(error);

  await expect(getUpcoming({ ownerIds: ["o1"] })).rejects.toBe(error);
});
