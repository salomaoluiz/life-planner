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
  await createStockCategory({
    ...owner,
    color: "#112233",
    icon: "cart",
    name: "Dairy",
    parentId: "p",
  });
  await createStockLocation({
    ...owner,
    color: "#112233",
    icon: "archive",
    name: "Pantry",
  });
  await createStockCategorySuggestions(owner);
  await createStockLocationSuggestions(owner);
  await updateStockCategory({ id: "c", name: "N", status: "ARCHIVED" });
  await updateStockLocation({ id: "l", name: "M" });
  await deleteStockCategory("c");
  await deleteStockLocation("l", "other");

  expect(spies.post.mock.calls.map((call) => call[0])).toEqual([
    "/v1/stock/categories",
    "/v1/stock/locations",
    "/v1/stock/categories/suggestions",
    "/v1/stock/locations/suggestions",
  ]);
  expect(spies.post).toHaveBeenCalledWith("/v1/stock/categories", {
    ...owner,
    color: "#112233",
    icon: "cart",
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
  expect(spies.delete).toHaveBeenCalledWith(
    "/v1/stock/locations/l?moveTo=other",
  );
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
    async () =>
      createStockCategory({
        ...owner,
        color: "#112233",
        icon: "cart",
        name: "x",
      }),
    "post",
  ],
  [
    "createStockLocation",
    async () =>
      createStockLocation({
        ...owner,
        color: "#112233",
        icon: "archive",
        name: "x",
      }),
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

it("SHOULD read every owner WHEN no owner is given AND send the suggestion keys", async () => {
  spies.get.mockResolvedValue({ items: [] });

  await getStockCategories({ includeArchived: true });
  await getStockLocations({});
  await createStockCategorySuggestions({ ...owner, keys: ["DAIRY"] });

  expect(spies.get).toHaveBeenNthCalledWith(
    1,
    "/v1/stock/categories?includeArchived=true",
  );
  expect(spies.get).toHaveBeenNthCalledWith(
    2,
    "/v1/stock/locations?includeArchived=false",
  );
  expect(spies.post).toHaveBeenCalledWith("/v1/stock/categories/suggestions", {
    ...owner,
    keys: ["DAIRY"],
  });
});

it("SHOULD map the trees WITH color, icon, owner and children", async () => {
  spies.get.mockResolvedValueOnce({
    items: [
      {
        children: [
          {
            children: [],
            id: "c",
            name: "Cheese",
            parentId: "p",
            status: "ACTIVE",
          },
        ],
        color: "#60A5FA",
        icon: "cup",
        id: "p",
        itemCount: 4,
        name: "Dairy",
        owner: "FAMILY",
        ownerId: "f",
        status: "ACTIVE",
      },
    ],
  });
  spies.get.mockResolvedValueOnce({
    items: [
      {
        children: [
          {
            children: [],
            id: "s",
            name: "Shelf",
            parentId: "l",
            status: "ACTIVE",
          },
        ],
        color: "#F59E0B",
        icon: "archive",
        id: "l",
        itemCount: 1,
        name: "Pantry",
        owner: "USER",
        ownerId: "u",
        status: "ACTIVE",
      },
    ],
  });

  const [category] = await getStockCategories({ includeArchived: true });
  const [location] = await getStockLocations({ includeArchived: true });

  expect(category).toMatchObject({
    color: "#60A5FA",
    icon: "cup",
    owner: "FAMILY",
    ownerId: "f",
  });
  expect(category.children[0]).toMatchObject({
    color: "#8A8F98",
    icon: "package-variant",
    parentId: "p",
  });
  expect(location.children[0]).toMatchObject({ parentId: "l" });
  expect(location).toMatchObject({ color: "#F59E0B", icon: "archive" });
});
