import CategoryModel from "../CategoryModel";
import { OwnerType } from "../TransactionModel";

const jsonMock = {
  depth_level: 0,
  icon: "category-icon",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b8",
  name: "Category Name",
  owner: "FAMILY",
  owner_id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  parent_id: "parent-id",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new CategoryModel({
    depthLevel: jsonMock.depth_level,
    icon: jsonMock.icon,
    id: jsonMock.id,
    name: jsonMock.name,
    owner: jsonMock.owner as OwnerType,
    ownerId: jsonMock.owner_id,
    parentId: jsonMock.parent_id,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
