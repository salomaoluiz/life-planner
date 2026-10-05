import CategoryModel from "../CategoryModel";
import { OwnerType } from "../TransactionModel";

// API / cache shape: camelCase, hex color, parentId null for roots.
const jsonMock = {
  depthLevel: 1,
  icon: "category-icon",
  iconColor: "#2E7D32",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b8",
  name: "Category Name",
  owner: "FAMILY",
  ownerId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  parentId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  type: "EXPENSE",
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new CategoryModel({
    depthLevel: jsonMock.depthLevel,
    icon: jsonMock.icon,
    iconColor: jsonMock.iconColor,
    id: jsonMock.id,
    name: jsonMock.name,
    owner: jsonMock.owner as OwnerType,
    ownerId: jsonMock.ownerId,
    parentId: jsonMock.parentId,
    type: jsonMock.type,
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
