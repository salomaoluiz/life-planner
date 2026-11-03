import { Datasources } from "@data/datasource";
import { FamilyStatus } from "@domain/entities/family/FamilyStatus";
import OwnerEntity, { OwnerType } from "@domain/entities/user/OwnerEntity";

// Owners come from the families embedded in `/user/me` (spec 074). Unlike `getUser` this never reads the cached
// profile: families change (create, archive, leave) while the profile stays the same.
async function getOwners(datasources: Datasources): Promise<OwnerEntity[]> {
  const user = await datasources.userDatasource.getUser();

  const families = user.families.map(
    (family) =>
      new OwnerEntity({
        archived: family.status === FamilyStatus.ARCHIVED,
        name: family.name,
        ownerId: family.id,
        type: OwnerType.FAMILY,
      }),
  );

  return [
    ...families,
    new OwnerEntity({
      name: user.name,
      ownerId: user.id,
      type: OwnerType.USER,
    }),
  ];
}

export default getOwners;
