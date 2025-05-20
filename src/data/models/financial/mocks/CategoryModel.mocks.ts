import CategoryModel, { OwnerType } from "../CategoryModel";

// region mocks

const jsonMock = {
  depth_level: 1,
  icon: "icon",
  id: "f9f8a869-85fc-4e1f-8777-d2331b78eac9",
  name: "Category Name",
  owner: "FAMILY",
  owner_id: "f9f8a869-85fc-4e1f-8777-d2331b78eac9",
  parent_id: "f9f8a869-85fc-4e1f-8777-d2331b78eac9",
};

// endregion mocks

// region spies

// endregion spies

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

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
