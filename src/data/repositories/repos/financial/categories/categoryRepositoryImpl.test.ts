import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/categoryRepositoryImpl.mocks";

it("SHOULD call createCategory correctly", async () => {
  const { createCategory } = setup();

  const params = {
    depthLevel: 1,
    icon: "some-icon",
    name: "Some Category",
    owner: OwnerType.FAMILY,
    ownerId: "1dcc732e-8886-4a68-b669-ded3f3809c20",
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
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "6eff80a7-e5e2-499d-9e47-5a448a753a03",
  };

  await deleteCategory(params);

  expect(spies.deleteCategory).toHaveBeenCalledTimes(1);
  expect(spies.deleteCategory).toHaveBeenCalledWith(params, mocks.datasources);
});

it("SHOULD call getCategories correctly", async () => {
  const { getCategories } = setup();

  const ownerIds = ["bb3443d4-a9bd-401e-9732-d6bf0dca7e83"];

  const categories = await getCategories(ownerIds);

  expect(spies.getCategories).toHaveBeenCalledTimes(1);
  expect(spies.getCategories).toHaveBeenCalledWith(ownerIds, mocks.datasources);
  expect(categories).toEqual("getCategories response");
});

it("SHOULD call updateCategory correctly", async () => {
  const { updateCategory } = setup();

  const params = {
    id: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
    ownerId: "bb3443d4-a9bd-401e-9732-d6bf0dca7e83",
  };

  await updateCategory(params);

  expect(spies.updateCategory).toHaveBeenCalledTimes(1);
  expect(spies.updateCategory).toHaveBeenCalledWith(params, mocks.datasources);
});
