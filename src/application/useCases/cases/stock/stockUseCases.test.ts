import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError, FieldRequired } from "@domain/entities/errors";
import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";
import {
  StockCatalogStatus,
  StockCategoryEntity,
  StockLocationEntity,
} from "@domain/entities/stock/StockCatalogEntity";
import StockMovementEntity, {
  StockMovementTypes,
} from "@domain/entities/stock/StockMovementEntity";
import Repositories from "@domain/repositories";

import createStockCategorySuggestionsUseCase from "./createStockCategorySuggestionsUseCase";
import createStockCategoryUseCase from "./createStockCategoryUseCase";
import createStockItemUseCase from "./createStockItemUseCase";
import createStockLocationSuggestionsUseCase from "./createStockLocationSuggestionsUseCase";
import createStockLocationUseCase from "./createStockLocationUseCase";
import createStockMovementUseCase from "./createStockMovementUseCase";
import deleteStockCategoryUseCase from "./deleteStockCategoryUseCase";
import deleteStockItemUseCase from "./deleteStockItemUseCase";
import deleteStockLocationUseCase from "./deleteStockLocationUseCase";
import getOwnerChangePreviewUseCase from "./getOwnerChangePreviewUseCase";
import getStockCategoriesUseCase from "./getStockCategoriesUseCase";
import getStockItemsUseCase from "./getStockItemsUseCase";
import getStockItemUseCase from "./getStockItemUseCase";
import getStockLocationsUseCase from "./getStockLocationsUseCase";
import getStockMovementsUseCase from "./getStockMovementsUseCase";
import suggestStockItemsUseCase from "./suggestStockItemsUseCase";
import updateStockCategoryUseCase from "./updateStockCategoryUseCase";
import updateStockItemUseCase from "./updateStockItemUseCase";
import updateStockLocationUseCase from "./updateStockLocationUseCase";

const repository = jest.mocked(repositoriesMocks.stockRepository);
const entity = new StockEntityFixture().withDefault().build() as never;
const movement = new StockMovementEntity({
  createdAt: new Date(2026, 10, 10),
  id: "m",
  lotId: "l",
  quantity: 1,
  type: StockMovementTypes.ENTRY,
});
const category = new StockCategoryEntity({
  children: [],
  id: "c",
  itemCount: 0,
  name: "Dairy",
  status: StockCatalogStatus.ACTIVE,
});
const location = new StockLocationEntity({
  id: "l",
  itemCount: 0,
  name: "Pantry",
  status: StockCatalogStatus.ACTIVE,
});

interface Case {
  check?: (result: unknown) => void;
  factory: (repositories: Repositories) => {
    execute: (params: never) => Promise<unknown>;
    uniqueName: string;
  };
  method: keyof typeof repository;
  name: string;
  params: unknown;
  // What the use case should hand to the repository (defaults to the params).
  repoParams?: unknown;
  repoResult?: unknown;
}

const owner = { owner: "USER", ownerId: "owner" };
const cases: Case[] = [
  {
    check: (result) =>
      expect(result).toMatchObject({ id: (entity as { id: string }).id }),
    factory: getStockItemUseCase as never,
    method: "getStockItem",
    name: "getStockItem",
    params: { id: "i" },
    repoParams: "i",
    repoResult: entity,
  },
  {
    check: (result) =>
      expect((result as { movements: unknown[] }).movements).toHaveLength(1),
    factory: createStockMovementUseCase as never,
    method: "createStockMovement",
    name: "createStockMovement",
    params: { itemId: "i", ownerId: "o", quantity: 1, type: "ENTRY" },
    repoResult: { item: entity, movements: [movement] },
  },
  {
    check: (result) => expect(result).toMatchObject({ nextCursor: "n" }),
    factory: getStockMovementsUseCase as never,
    method: "getStockMovements",
    name: "getStockMovements",
    params: { itemId: "i" },
    repoResult: { items: [movement], nextCursor: "n" },
  },
  {
    factory: getOwnerChangePreviewUseCase as never,
    method: "getOwnerChangePreview",
    name: "getOwnerChangePreview",
    params: { itemId: "i", ...owner },
    repoResult: { category: {}, location: {} },
  },
  {
    factory: suggestStockItemsUseCase as never,
    method: "suggestStockItems",
    name: "suggestStockItems",
    params: { ...owner, q: "mi" },
    repoResult: [],
  },
  {
    check: (result) =>
      expect((result as Array<{ name: string }>)[0].name).toBe("Dairy"),
    factory: getStockCategoriesUseCase as never,
    method: "getStockCategories",
    name: "getStockCategories",
    params: owner,
    repoResult: [category],
  },
  {
    factory: createStockCategoryUseCase as never,
    method: "createStockCategory",
    name: "createStockCategory",
    params: { ...owner, name: "A" },
  },
  {
    factory: updateStockCategoryUseCase as never,
    method: "updateStockCategory",
    name: "updateStockCategory",
    params: { id: "c", name: "A" },
  },
  {
    factory: deleteStockCategoryUseCase as never,
    method: "deleteStockCategory",
    name: "deleteStockCategory",
    params: { id: "c" },
  },
  {
    factory: createStockCategorySuggestionsUseCase as never,
    method: "createStockCategorySuggestions",
    name: "createStockCategorySuggestions",
    params: owner,
  },
  {
    check: (result) =>
      expect((result as Array<{ name: string }>)[0].name).toBe("Pantry"),
    factory: getStockLocationsUseCase as never,
    method: "getStockLocations",
    name: "getStockLocations",
    params: owner,
    repoResult: [location],
  },
  {
    factory: createStockLocationUseCase as never,
    method: "createStockLocation",
    name: "createStockLocation",
    params: { ...owner, name: "A" },
  },
  {
    factory: updateStockLocationUseCase as never,
    method: "updateStockLocation",
    name: "updateStockLocation",
    params: { id: "l", status: "ARCHIVED" },
  },
  {
    factory: deleteStockLocationUseCase as never,
    method: "deleteStockLocation",
    name: "deleteStockLocation",
    params: { id: "l" },
  },
  {
    factory: createStockLocationSuggestionsUseCase as never,
    method: "createStockLocationSuggestions",
    name: "createStockLocationSuggestions",
    params: owner,
  },
  {
    factory: deleteStockItemUseCase as never,
    method: "deleteStockItem",
    name: "deleteStockItem",
    params: { id: "i", ownerId: "o" },
  },
];

beforeEach(() => {
  jest.clearAllMocks();
});

describe.each(cases)("$name", (testCase) => {
  const useCase = testCase.factory(repositoriesMocks);
  const call = repository[testCase.method] as jest.Mock;

  it("SHOULD call the repository with its params AND return the mapped result", async () => {
    call.mockResolvedValueOnce(testCase.repoResult);

    const result = await useCase.execute(testCase.params as never);

    expect(call).toHaveBeenCalledWith(testCase.repoParams ?? testCase.params);
    testCase.check?.(result);
  });

  it("SHOULD add the use case to a business error AND re-throw it", async () => {
    const error = new BusinessError();

    call.mockRejectedValueOnce(error);

    await expect(useCase.execute(testCase.params as never)).rejects.toBe(error);
    expect(error.context).toMatchObject({
      useCase: expect.stringContaining("UseCase"),
    });
  });

  it("SHOULD re-throw an unknown error untouched", async () => {
    const error = new Error("boom");

    call.mockRejectedValueOnce(error);

    await expect(useCase.execute(testCase.params as never)).rejects.toBe(error);
  });

  it("SHOULD expose a unique stock name", () => {
    expect(useCase.uniqueName).toMatch(/^stock\./);
  });
});

describe("getStockItemsUseCase", () => {
  const useCase = getStockItemsUseCase(repositoriesMocks);

  it("SHOULD read every owner AND flatten the items into DTOs", async () => {
    repository.getStockItems.mockResolvedValueOnce([entity]);
    repository.getStockItems.mockResolvedValueOnce([entity]);

    const result = await useCase.execute({ ownerIds: ["a", "b"] });

    expect(repository.getStockItems).toHaveBeenCalledWith("a");
    expect(repository.getStockItems).toHaveBeenCalledWith("b");
    expect(result).toHaveLength(2);
  });

  it("SHOULD add the context of a business error and re-throw it, and re-throw an unknown one", async () => {
    const business = new BusinessError();

    repository.getStockItems.mockRejectedValueOnce(business);
    await expect(useCase.execute({ ownerIds: ["a"] })).rejects.toBe(business);
    expect(business.context).toMatchObject({ useCase: "getStockItemsUseCase" });

    const unknown = new Error("x");

    repository.getStockItems.mockRejectedValueOnce(unknown);
    await expect(useCase.execute({ ownerIds: ["a"] })).rejects.toBe(unknown);
  });
});

describe("createStockItemUseCase", () => {
  const useCase = createStockItemUseCase(repositoriesMocks);
  const params = {
    description: "Rice",
    owner: "USER",
    ownerId: "owner",
    quantity: 0,
    unit: "kilogram",
  };

  it("SHOULD fill the warning defaults AND accept a quantity of 0 (an item with no lot)", async () => {
    await useCase.execute(params);

    expect(repository.createStockItem).toHaveBeenCalledWith(
      expect.objectContaining({
        quantity: 0,
        stockOnly: false,
        warnDaysClosed: 7,
        warnDaysOpened: 1,
      }),
    );
  });

  it("SHOULD pass the optional fields through", async () => {
    await useCase.execute({
      ...params,
      categoryId: "c",
      minQuantity: 1,
      stockOnly: true,
      warnDaysClosed: 3,
      warnDaysOpened: 0,
    });

    expect(repository.createStockItem).toHaveBeenCalledWith(
      expect.objectContaining({
        categoryId: "c",
        minQuantity: 1,
        stockOnly: true,
        warnDaysClosed: 3,
        warnDaysOpened: 0,
      }),
    );
  });

  it.each(["description", "owner", "ownerId", "quantity", "unit"])(
    "SHOULD throw FieldRequired WHEN %s is missing",
    async (field) => {
      const error = await useCase
        .execute({
          ...params,
          [field]: field === "quantity" ? undefined : "",
        } as never)
        .catch((caught) => caught);

      expect(error).toBeInstanceOf(FieldRequired);
      expect(error).toHaveProperty("message", `Fields ${field} are required`);
      expect(repository.createStockItem).not.toHaveBeenCalled();
    },
  );

  it("SHOULD re-throw the repository errors", async () => {
    const business = new BusinessError();

    repository.createStockItem.mockRejectedValueOnce(business);
    await expect(useCase.execute(params)).rejects.toBe(business);

    const unknown = new Error("x");

    repository.createStockItem.mockRejectedValueOnce(unknown);
    await expect(useCase.execute(params)).rejects.toBe(unknown);
  });
});

describe("updateStockItemUseCase", () => {
  const useCase = updateStockItemUseCase(repositoriesMocks);

  it("SHOULD pass every param to the repository", async () => {
    const params = {
      categoryId: null,
      id: "i",
      minQuantity: 2,
      previousOwnerId: "o",
    };

    await useCase.execute(params);

    expect(repository.updateStockItem).toHaveBeenCalledWith(params);
  });

  it("SHOULD throw FieldRequired WITHOUT an id", async () => {
    await expect(
      useCase.execute({ id: "", previousOwnerId: "o" }),
    ).rejects.toBeInstanceOf(FieldRequired);
  });

  it("SHOULD re-throw the repository errors", async () => {
    const business = new BusinessError();

    repository.updateStockItem.mockRejectedValueOnce(business);
    await expect(
      useCase.execute({ id: "i", previousOwnerId: "o" }),
    ).rejects.toBe(business);

    const unknown = new Error("x");

    repository.updateStockItem.mockRejectedValueOnce(unknown);
    await expect(
      useCase.execute({ id: "i", previousOwnerId: "o" }),
    ).rejects.toBe(unknown);
  });
});
