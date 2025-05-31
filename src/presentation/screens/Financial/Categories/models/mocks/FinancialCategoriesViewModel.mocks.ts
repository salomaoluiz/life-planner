import { faker } from "@faker-js/faker";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import CategoryEntityFixture from "@domain/entities/financial/mocks/CategoryEntity.fixture";
import OwnerEntityFixture from "@domain/entities/user/mocks/OwnerEntity.fixture";
import FinancialCategoriesViewModel from "@screens/Financial/Categories/models/FinancialCategoriesViewModel";

// region Mocks
faker.seed(371499208132932);

const ownerEntityFixture = new OwnerEntityFixture();
const userOwner = OwnerDTO.fromEntity(
  ownerEntityFixture.withUserDefault().build(),
);
const familyOwner = OwnerDTO.fromEntity(
  ownerEntityFixture.withFamilyDefault().build(),
);
const ownersMock = [userOwner, familyOwner];

const entityBuilder = new CategoryEntityFixture().withDefault();
const dtosMock = new Array(2).fill(1).map((_, index) => {
  const entity = entityBuilder
    .withName(`Category - ${index}`)
    .withId(faker.string.uuid())
    .withOwner(ownersMock[index].type)
    .withOwnerId(ownersMock[index].id)
    .build();
  return CategoryDTO.fromEntity(entity);
});

const dtosChildrenMock = new Array(2).fill(1).map((_, index) => {
  const entity = entityBuilder
    .withId(faker.string.uuid())
    .withName(`Subcategory - ${index}`)
    .withParentId(dtosMock[index].id)
    .withDepthLevel(1)
    .withOwner(ownersMock[index].type)
    .withOwnerId(ownersMock[index].id)
    .build();
  return CategoryDTO.fromEntity(entity);
});

const dtosSubChildrenMock = new Array(2).fill(1).map((_, index) => {
  const entity = entityBuilder
    .withId(faker.string.uuid())
    .withName(`Sub-Subcategory - ${index}`)
    .withParentId(dtosChildrenMock[index].id)
    .withDepthLevel(2)
    .withOwner(ownersMock[index].type)
    .withOwnerId(ownersMock[index].id)
    .build();
  return CategoryDTO.fromEntity(entity);
});

// endregion Mocks

// region Spies

// endregion Spies

function setup(dtos?: CategoryDTO[], owners?: OwnerDTO[]) {
  return new FinancialCategoriesViewModel(
    dtos ?? dtosMock,
    owners ?? ownersMock,
  );
}

const mocks = {
  dtos: dtosMock,
  dtosChildren: dtosChildrenMock,
  dtosSubChildren: dtosSubChildrenMock,
  owners: ownersMock,
};

export { mocks, setup };
