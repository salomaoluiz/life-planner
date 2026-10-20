import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";
import TagModel from "@data/models/financial/TagModel";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import tagRepositoryImpl from "./tagRepositoryImpl";

const datasource = jest.mocked(datasourcesMocks.financialTagDatasource);
const model = new TagModel({
  id: "tag-1",
  name: "gasto-fixo",
  owner: "USER",
  ownerId: "user-id",
  scope: "ALL",
  scopes: [
    { owner: "USER", ownerId: "user-id" },
    { owner: "FAMILY", ownerId: "family-id" },
  ],
  usageCount: 3,
});
const invalidate = jest.spyOn(cache, "invalidate");
const cacheGet = jest.spyOn(cache, "get");
const cacheSet = jest.spyOn(cache, "set");

beforeEach(() => {
  jest.clearAllMocks();
  cacheGet.mockReturnValue(null);
  datasource.getTags.mockResolvedValue([model]);
  datasource.createTag.mockResolvedValue(model);
});

function setup() {
  return tagRepositoryImpl(datasourcesMocks);
}

it("SHOULD read the datasource AND cache the tags WHEN the cache is empty", async () => {
  const [tag] = await setup().getTags(["user-id"]);

  expect(datasource.getTags).toHaveBeenCalledWith(["user-id"]);
  expect(cacheSet).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TAG_DATA,
    [model.toJSON()],
  );
  expect(tag).toMatchObject({
    id: "tag-1",
    scope: "ALL",
    scopeOwnerIds: ["user-id", "family-id"],
    usageCount: 3,
  });
});

it("SHOULD NOT call the datasource WHEN the cache has the tags", async () => {
  cacheGet.mockReturnValue([model.toJSON()]);

  const tags = await setup().getTags(["user-id"]);

  expect(datasource.getTags).not.toHaveBeenCalled();
  expect(tags).toHaveLength(1);
});

it("SHOULD invalidate the tags on create", async () => {
  const tag = await setup().createTag({ name: "x", owner: "ALL" });

  expect(datasource.createTag).toHaveBeenCalledWith({
    name: "x",
    owner: "ALL",
  });
  expect(invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TAG_DATA,
  );
  expect(tag.id).toBe("tag-1");
});

it("SHOULD invalidate the tags AND the transactions on update and delete", async () => {
  await setup().updateTag({ id: "tag-1", name: "novo" });
  await setup().deleteTag("tag-1");

  expect(datasource.updateTag).toHaveBeenCalledWith({
    id: "tag-1",
    name: "novo",
  });
  expect(datasource.deleteTag).toHaveBeenCalledWith("tag-1");
  expect(invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FINANCIAL_TRANSACTION_DATA,
  );
  expect(invalidate).toHaveBeenCalledTimes(4);
});
