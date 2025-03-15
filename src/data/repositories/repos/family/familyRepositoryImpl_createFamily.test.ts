import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyRepositoryImpl_createFamily.mocks";

it("SHOULD create a family", async () => {
  spies.createFamily.mockResolvedValueOnce(mocks.createFamilySuccessMock);

  const result = await setup();

  expect(result).toEqual(
    new FamilyEntity({
      id: "123",
      name: "Family Name",
      ownerId: "123",
    }),
  );
});

it("SHOULD invalidate cache", async () => {
  spies.createFamily.mockResolvedValueOnce(mocks.createFamilySuccessMock);

  await setup();

  expect(spies.cache.invalidate).toHaveBeenCalledTimes(1);
  expect(spies.cache.invalidate).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
});

it('SHOULD call "createFamily" with correct params', async () => {
  spies.createFamily.mockResolvedValueOnce(mocks.createFamilySuccessMock);

  await setup();

  expect(spies.createFamily).toHaveBeenCalledTimes(1);
  expect(spies.createFamily).toHaveBeenCalledWith({
    name: "Family Name",
    ownerId: "123",
  });
});
