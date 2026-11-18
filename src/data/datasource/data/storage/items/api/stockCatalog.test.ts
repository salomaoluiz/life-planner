import {
  ApiBusinessError,
  GenericError,
  StockCategoryInUse,
  StockLocationInUse,
} from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import {
  createStockCategory,
  createStockCategorySuggestions,
  createStockLocation,
  createStockLocationSuggestions,
  deleteStockCategory,
  deleteStockLocation,
  getStockCategories,
  getStockLocations,
  updateStockCategory,
  updateStockLocation,
} from "./stockCatalog";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const spies = {
  delete: jest.mocked(api.delete),
  get: jest.mocked(api.get),
  patch: jest.mocked(api.patch),
  post: jest.mocked(api.post),
};

beforeEach(() => {
  jest.resetAllMocks();
});

const owner = { owner: "FAMILY", ownerId: "family-id" };

it("SHOULD GET the category tree and the locations of an owner, archived ones on request", async () => {
  spies.get.mockResolvedValueOnce({
    items: [
      { children: [], id: "c", itemCount: 1, name: "Dairy", status: "ACTIVE" },
    ],
  });
  spies.get.mockResolvedValueOnce({
    items: [{ id: "l", itemCount: 0, name: "Pantry", status: "ACTIVE" }],
  });

  const categories = await getStockCategories({
    ...owner,
    includeArchived: true,
  });
  const locations = await getStockLocations(owner);

  expect(spies.get).toHaveBeenNthCalledWith(
    1,
    "/v1/stock/categories?owner=FAMILY&ownerId=family-id&includeArchived=true",
  );
  expect(spies.get).toHaveBeenNthCalledWith(
    2,
    "/v1/stock/locations?owner=FAMILY&ownerId=family-id&includeArchived=false",
  );
  expect(categories[0].name).toBe("Dairy");
  expect(locations[0].name).toBe("Pantry");
});

it("SHOULD POST creates and suggestions, PATCH updates without the id in the body, DELETE by id", async () => {
  await createStockCategory({ ...owner, name: "Dairy", parentId: "p" });
  await createStockLocation({ ...owner, name: "Pantry" });
  await createStockCategorySuggestions(owner);
  await createStockLocationSuggestions(owner);
  await updateStockCategory({ id: "c", name: "N", status: "ARCHIVED" });
  await updateStockLocation({ id: "l", name: "M" });
  await deleteStockCategory("c");
  await deleteStockLocation("l");

  expect(spies.post.mock.calls.map((call) => call[0])).toEqual([
    "/v1/stock/categories",
    "/v1/stock/locations",
    "/v1/stock/categories/suggestions",
    "/v1/stock/locations/suggestions",
  ]);
  expect(spies.post).toHaveBeenCalledWith("/v1/stock/categories", {
    ...owner,
    name: "Dairy",
    parentId: "p",
  });
  expect(spies.patch).toHaveBeenCalledWith("/v1/stock/categories/c", {
    name: "N",
    status: "ARCHIVED",
  });
  expect(spies.patch).toHaveBeenCalledWith("/v1/stock/locations/l", {
    name: "M",
  });
  expect(spies.delete).toHaveBeenCalledWith("/v1/stock/categories/c");
  expect(spies.delete).toHaveBeenCalledWith("/v1/stock/locations/l");
});

it("SHOULD map the 409 of a delete in use to its error with the item count", async () => {
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Category is in use", 409, {}, { itemCount: 3 }),
  );
  spies.delete.mockRejectedValueOnce(
    new ApiBusinessError("Location is in use", 409, {}, { itemCount: 2 }),
  );

  const category = await deleteStockCategory("c").catch((error) => error);
  const location = await deleteStockLocation("l").catch((error) => error);

  expect(category).toBeInstanceOf(StockCategoryInUse);
  expect(category.itemCount).toBe(3);
  expect(location).toBeInstanceOf(StockLocationInUse);
  expect(location.itemCount).toBe(2);
});

it.each([
  ["getStockCategories", async () => getStockCategories(owner), "get"],
  ["getStockLocations", async () => getStockLocations(owner), "get"],
  [
    "createStockCategory",
    async () => createStockCategory({ ...owner, name: "x" }),
    "post",
  ],
  [
    "createStockLocation",
    async () => createStockLocation({ ...owner, name: "x" }),
    "post",
  ],
  [
    "createStockCategorySuggestions",
    async () => createStockCategorySuggestions(owner),
    "post",
  ],
  [
    "createStockLocationSuggestions",
    async () => createStockLocationSuggestions(owner),
    "post",
  ],
  [
    "updateStockCategory",
    async () => updateStockCategory({ id: "c", name: "x" }),
    "patch",
  ],
  [
    "updateStockLocation",
    async () => updateStockLocation({ id: "l", name: "x" }),
    "patch",
  ],
  ["deleteStockCategory", async () => deleteStockCategory("c"), "delete"],
  ["deleteStockLocation", async () => deleteStockLocation("l"), "delete"],
] as const)(
  "SHOULD wrap a failure of %s in GenericError",
  async (_name, run, method) => {
    spies[method].mockRejectedValueOnce(new ApiBusinessError("Boom", 500));

    await expect(run()).rejects.toBeInstanceOf(GenericError);
  },
);
