import TransactionModel, {
  OwnerType,
  TransactionType,
} from "../TransactionModel";

// region mocks

const jsonMock = {
  account_id: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: "Some Category",
  category_id: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: "2023-10-01T00:00:00Z",
  description: "Some Description",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  owner: "FAMILY",
  owner_id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  type: "EXPENSE",
  value: "100.00",
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new TransactionModel({
    accountId: jsonMock.account_id,
    category: jsonMock.category,
    categoryId: jsonMock.category_id,
    date: jsonMock.date,
    description: jsonMock.description,
    id: jsonMock.id,
    owner: jsonMock.owner as OwnerType,
    ownerId: jsonMock.owner_id,
    type: jsonMock.type as TransactionType,
    value: jsonMock.value,
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
