import FamilyModel from "../FamilyModel";

// region mocks

const jsonMock = {
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  name: "Family Name",
  owner_id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new FamilyModel({
    id: jsonMock.id,
    name: jsonMock.name,
    ownerId: jsonMock.owner_id,
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
