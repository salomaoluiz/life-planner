import { faker } from "@faker-js/faker";

import { render } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import CategoryEntityFixture from "@domain/entities/financial/mocks/CategoryEntity.fixture";
import OwnerEntityFixture from "@domain/entities/user/mocks/OwnerEntity.fixture";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import * as useCategoryItem from "@screens/Financial/Categories/containers/CategoryItem/useCategoryItem";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

import CategoryItem, { Props } from "../";

// region mocks
faker.seed(638491830199442);

const categoryBuilder = new CategoryEntityFixture().withDefault();
const ownerBuilder = new OwnerEntityFixture().withDefault();

const ownerFamilyDTO = OwnerDTO.fromEntity(
  ownerBuilder.withFamilyDefault().build(),
);

const ownerUserDTO = OwnerDTO.fromEntity(
  ownerBuilder.withUserDefault().build(),
);

const categoryFamilyDTO = CategoryDTO.fromEntity(
  categoryBuilder
    .withOwner(OwnerType.FAMILY)
    .withId(faker.string.uuid())
    .withOwnerId(ownerFamilyDTO.id)
    .build(),
);

const categoryUserDTO = CategoryDTO.fromEntity(
  categoryBuilder
    .withOwner(OwnerType.USER)
    .withId(faker.string.uuid())
    .withOwnerId(ownerUserDTO.id)
    .build(),
);

const categoryFamilyMock = new CategoryViewModel(
  categoryFamilyDTO,
  ownerFamilyDTO,
);

const categoryUserMock = new CategoryViewModel(categoryUserDTO, ownerUserDTO);

const defaultProps: Props = {
  category: categoryFamilyMock,
};

const useCategoryItemMock = {
  onDelete: jest.fn(),
  onEdit: jest.fn(),
};
// endregion mocks

// region spies

const useCategoryItemSpy = jest
  .spyOn(useCategoryItem, "default")
  .mockReturnValue(useCategoryItemMock);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function renderComponent(props?: Partial<Props>) {
  return <CategoryItem {...defaultProps} {...props} />;
}

function setup(props?: Partial<Props>) {
  render(renderComponent(props));
}

const spies = {
  useCategoryItem: useCategoryItemSpy,
};

const mocks = {
  categoryFamily: categoryFamilyMock,
  categoryUser: categoryUserMock,
  defaultProps,
  useCategoryItem: useCategoryItemMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, renderComponent, setup, spies };
export { screen, act } from "@tests";
