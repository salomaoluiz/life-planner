import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

import { mocks, setup, spies } from "./mocks/getOwners.mocks";

beforeEach(() => {
  spies.userDatasource.getUser.mockResolvedValue(mocks.userModel);
});

it("SHOULD return the families first AND the personal owner last", async () => {
  const result = await setup();

  expect(result).toEqual([
    new OwnerEntity({
      archived: false,
      name: "Family",
      ownerId: "family-1",
      type: OwnerType.FAMILY,
    }),
    new OwnerEntity({
      archived: true,
      name: "Old",
      ownerId: "family-2",
      type: OwnerType.FAMILY,
    }),
    new OwnerEntity({
      name: mocks.userModel.name,
      ownerId: mocks.userModel.id,
      type: OwnerType.USER,
    }),
  ]);
});

it("SHOULD return only the personal owner WHEN the user has no family", async () => {
  spies.userDatasource.getUser.mockResolvedValue(
    Object.assign(Object.create(Object.getPrototypeOf(mocks.userModel)), {
      ...mocks.userModel,
      families: [],
    }),
  );

  const result = await setup();

  expect(result.map((owner) => owner.type)).toEqual([OwnerType.USER]);
});

it("SHOULD hit the datasource EVEN WHEN the profile is cached AND leave the cache alone", async () => {
  spies.cache.get.mockReturnValue(mocks.userModel.toJSON());

  await setup();

  expect(spies.userDatasource.getUser).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();
});
