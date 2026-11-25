import { api } from "@infrastructure/api";

import {
  dismissLeftover,
  getConsumptionWeeks,
  getWaste,
} from "./stockForecast";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), post: jest.fn() },
}));

const apiGet = jest.mocked(api.get);

beforeEach(() => jest.clearAllMocks());

it("SHOULD dismiss the leftover with a POST AND undo it with a DELETE", async () => {
  await dismissLeftover({ dismissed: true, lotId: "lot" });
  await dismissLeftover({ dismissed: false, lotId: "lot" });

  expect(api.post).toHaveBeenCalledWith(
    "/v1/stock/lots/lot/leftover-dismissal",
    {},
  );
  expect(api.delete).toHaveBeenCalledWith(
    "/v1/stock/lots/lot/leftover-dismissal",
  );
});

it("SHOULD read the weeks of an item with the local day", async () => {
  apiGet.mockResolvedValue({ weeks: [] });

  expect(await getConsumptionWeeks({ itemId: "i" })).toEqual([]);
  expect(apiGet).toHaveBeenCalledWith(
    expect.stringMatching(
      /^\/v1\/stock\/items\/i\/consumption-weeks\?today=\d{4}-\d{2}-\d{2}$/,
    ),
  );
});

it("SHOULD build the waste query from month, owner and all", async () => {
  apiGet.mockResolvedValue({ month: "2026-11" });

  await getWaste({});
  await getWaste({ all: true, month: "2026-11", ownerId: "o" });

  expect(apiGet).toHaveBeenNthCalledWith(1, "/v1/stock/waste");
  expect(apiGet).toHaveBeenNthCalledWith(
    2,
    "/v1/stock/waste?month=2026-11&ownerId=o&topLimit=all",
  );
});
