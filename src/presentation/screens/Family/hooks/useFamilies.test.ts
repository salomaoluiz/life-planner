import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import { givenData, setup, spies } from "./mocks/index.mocks";

it("SHOULD return the query state", () => {
  const { result } = setup();

  expect(result.current).toEqual({
    error: null,
    families: undefined,
    isFetching: false,
    refetch: expect.any(Function),
    status: "pending",
  });
});

it("SHOULD use the three use case names as cache key", () => {
  setup();

  expect(spies.useQuery.mock.calls[0][0].cacheKey).toEqual([
    "families",
    "members",
    "user",
  ]);
});

it("SHOULD refetch WHEN the screen is focused", () => {
  const { refetch } = setup({ focused: true });

  expect(refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT refetch WHEN the screen is not focused", () => {
  const { refetch } = setup({ focused: false });

  expect(refetch).not.toHaveBeenCalled();
});

describe("fetch", () => {
  async function runFetch() {
    setup();
    return (await spies.useQuery.mock.calls[0][0].fetch()) as FamilyViewModel[];
  }

  it("SHOULD build family view models with their members and users", async () => {
    givenData();

    const families = await runFetch();

    expect(spies.getMembers).toHaveBeenCalledWith("family-1");
    expect(families).toHaveLength(1);
    expect(families[0].familyName).toBe("Test Family");
    expect(families[0].familyMembers.map((m) => m.familyMemberName)).toEqual([
      "Alice Test",
      "bob@example.test",
    ]);
  });

  it("SHOULD only look up users for members that have a user id", async () => {
    givenData();

    await runFetch();

    expect(spies.getUser).toHaveBeenCalledTimes(1);
    expect(spies.getUser).toHaveBeenCalledWith("user-1");
  });

  it("SHOULD return an empty list WHEN there are no families", async () => {
    spies.getFamilies.mockResolvedValue([]);

    expect(await runFetch()).toEqual([]);
    expect(spies.getMembers).not.toHaveBeenCalled();
  });

  it("SHOULD reject WHEN a use case fails", async () => {
    givenData();
    spies.getMembers.mockRejectedValue(new Error("boom"));

    await expect(runFetch()).rejects.toThrow("boom");
  });
});
