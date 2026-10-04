import FamilyModel from "../FamilyModel";

// region mocks

const jsonMock = {
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  name: "Family Name",
  ownerId: "5b0a6c2e-1d3f-4a8b-9c7d-2e4f6a8b0c1d",
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
    ownerId: jsonMock.ownerId,
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
