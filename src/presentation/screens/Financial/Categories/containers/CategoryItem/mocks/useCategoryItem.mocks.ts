import { faker } from "@faker-js/faker";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import CategoryEntityFixture from "@domain/entities/financial/mocks/CategoryEntity.fixture";
import OwnerEntityFixture from "@domain/entities/user/mocks/OwnerEntity.fixture";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

import useCategoryItem, { Props } from "../useCategoryItem";

// region mocks
const categoryBuilder = new CategoryEntityFixture().withDefault();
const ownerBuilder = new OwnerEntityFixture().withDefault();

const ownerUserDTO = OwnerDTO.fromEntity(
  ownerBuilder.withUserDefault().build(),
);

const categoryUserDTO = CategoryDTO.fromEntity(
  categoryBuilder
    .withOwner(OwnerType.USER)
    .withId(faker.string.uuid())
    .withOwnerId(ownerUserDTO.id)
    .build(),
);

const categoryMock = new CategoryViewModel(categoryUserDTO, ownerUserDTO);

const defaultProps: Props = {
  category: categoryMock,
  refetch: jest.fn(),
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<Props>) {
  return useCategoryItem({ ...defaultProps, ...props });
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
