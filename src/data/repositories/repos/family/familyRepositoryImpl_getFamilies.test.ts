import FamilyEntity from "@domain/entities/family/FamilyEntity";
import { CacheStringKeys } from "@infrastructure/cache";

import {
  mocks,
  setup,
  spies,
} from "./mocks/familyRepositoryImpl_getFamilies.mocks";

it("SHOULD get families from cache", async () => {
  spies.cache.get.mockReturnValue(mocks.getFamiliesSuccessMock);

  const families = await setup();

  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
  expect(spies.getFamilies).not.toHaveBeenCalled();
  expect(spies.cache.set).not.toHaveBeenCalled();

  expect(families).toEqual(
    mocks.getFamiliesSuccessMock.map(
      (family) =>
        new FamilyEntity({
          id: family.id,
          name: family.name,
          ownerId: family.ownerId,
        }),
    ),
  );
});

it("SHOULD get families from datasource", async () => {
  spies.cache.get.mockReturnValue(null);
  spies.getFamilies.mockReturnValue(mocks.getFamiliesSuccessMock);

  const families = await setup();

  expect(spies.cache.get).toHaveBeenCalledTimes(1);
  expect(spies.cache.get).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
  );
  expect(spies.getFamilies).toHaveBeenCalledTimes(1);
  expect(spies.getFamilies).toHaveBeenCalledWith("1234");
  expect(spies.cache.set).toHaveBeenCalledTimes(1);
  expect(spies.cache.set).toHaveBeenCalledWith(
    CacheStringKeys.CACHE_FAMILIES_DATA,
    mocks.getFamiliesSuccessMock,
  );

  expect(families).toEqual(
    mocks.getFamiliesSuccessMock.map(
      (family) =>
        new FamilyEntity({
          id: family.id,
          name: family.name,
          ownerId: family.ownerId,
        }),
    ),
  );
});
