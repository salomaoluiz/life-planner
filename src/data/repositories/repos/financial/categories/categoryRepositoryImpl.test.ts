import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/categoryRepositoryImpl.mocks";

it("SHOULD call createCategory correctly", async () => {
  const { createCategory } = setup();

  const params = {
    depthLevel: 0,
    icon: "icon",
    name: "Category",
    owner: OwnerType.USER,
    ownerId: "user-id",
    parentId: undefined,
  };

  const category = await createCategory(params);

  expect(spies.createCategory).toHaveBeenCalledTimes(1);
  expect(spies.createCategory).toHaveBeenCalledWith(params, mocks.datasources);
  expect(category).toEqual("createCategory response");
});

it("SHOULD call deleteCategory correctly", async () => {
  const { deleteCategory } = setup();

  const params = {
    id: "cat-uuid",
    ownerId: "user-id",
  };

  await deleteCategory(params);

  expect(spies.deleteCategory).toHaveBeenCalledTimes(1);
  expect(spies.deleteCategory).toHaveBeenCalledWith(params, mocks.datasources);
});

it("SHOULD call getCategories correctly", async () => {
  const { getCategories } = setup();

  const ownerIds = ["user-id"];

  const categories = await getCategories(ownerIds);

  expect(spies.getCategories).toHaveBeenCalledTimes(1);
  expect(spies.getCategories).toHaveBeenCalledWith(ownerIds, mocks.datasources);
  expect(categories).toEqual("getCategories response");
});

it("SHOULD call updateCategory correctly", async () => {
  const { updateCategory } = setup();

  const params = {
    id: "cat-uuid",
    ownerId: "user-id",
  };

  await updateCategory(params);

  expect(spies.updateCategory).toHaveBeenCalledTimes(1);
  expect(spies.updateCategory).toHaveBeenCalledWith(params, mocks.datasources);
});
