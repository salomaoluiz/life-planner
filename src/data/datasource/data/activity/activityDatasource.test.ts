import { api } from "@infrastructure/api";

import activityDatasource from "./datasource";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

const datasource = activityDatasource();

beforeEach(() => jest.clearAllMocks());

it("SHOULD read the page with the filters in the query AND map it", async () => {
  jest.mocked(api.get).mockResolvedValue({
    items: [{ action: "DELETE", id: "a-1" }],
    nextCursor: "c2",
  });

  const page = await datasource.getActivity({
    action: "BATCH",
    cursor: "c1",
    module: "FINANCE",
    q: "1.200,00",
  });

  expect(api.get).toHaveBeenCalledWith(
    "/v1/activity?action=BATCH&cursor=c1&module=FINANCE&q=1.200%2C00",
  );
  expect(page.nextCursor).toBe("c2");
  expect(page.items[0]).toEqual(
    expect.objectContaining({ action: "DELETE", id: "a-1" }),
  );
});

it("SHOULD send only the module WHEN there are no other filters", async () => {
  jest.mocked(api.get).mockResolvedValue({});

  await datasource.getActivity({ module: "INVESTMENT" });

  expect(api.get).toHaveBeenCalledWith("/v1/activity?module=INVESTMENT");
});

it("SHOULD read the items of a batch with the search AND the cursor", async () => {
  jest.mocked(api.get).mockResolvedValue({ header: null, items: [] });

  await datasource.getActivityItems({ cursor: "c", id: "a-1", q: "padaria" });
  await datasource.getActivityItems({ id: "a-1" });

  expect(api.get).toHaveBeenNthCalledWith(
    1,
    "/v1/activity/a-1/items?cursor=c&q=padaria",
  );
  expect(api.get).toHaveBeenNthCalledWith(2, "/v1/activity/a-1/items");
});
