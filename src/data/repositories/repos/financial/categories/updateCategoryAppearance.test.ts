import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import updateCategoryAppearance from "./updateCategoryAppearance";

const datasource = jest.mocked(datasourcesMocks.financialCategoryDatasource);
const invalidate = jest.spyOn(cache, "invalidate");

beforeEach(() => {
  jest.clearAllMocks();
  datasource.updateCategoryAppearance.mockResolvedValue(undefined);
});

it("SHOULD forward the fields and descendants, then invalidate the category cache", async () => {
  const descendants = [{ icon: "folder", id: "child" }];

  await updateCategoryAppearance(
    { descendants, icon: "food", id: "parent" },
    datasourcesMocks,
  );

  expect(datasource.updateCategoryAppearance).toHaveBeenCalledWith(
    expect.objectContaining({ descendants, icon: "food", id: "parent" }),
  );
  expect(invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_CATEGORY_DATA,
  );
});

it("SHOULD NOT invalidate the cache WHEN the request fails", async () => {
  datasource.updateCategoryAppearance.mockRejectedValueOnce(new Error("boom"));

  await expect(
    updateCategoryAppearance(
      { descendants: [], id: "parent" },
      datasourcesMocks,
    ),
  ).rejects.toThrow("boom");
  expect(invalidate).not.toHaveBeenCalled();
});
