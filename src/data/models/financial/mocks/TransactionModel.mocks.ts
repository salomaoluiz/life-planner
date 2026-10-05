import { calendarDateToIso } from "../calendarDate";
import TransactionModel, {
  OwnerType,
  TransactionType,
} from "../TransactionModel";

// region mocks

// API / cache shape: camelCase, value in cents, date-only, category as an object.
const jsonMock = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  category: { name: "Some Category" },
  categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
  date: "2023-10-01",
  description: "Some Description",
  id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  owner: "FAMILY",
  ownerId: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
  type: "EXPENSE",
  value: 10000,
};

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return new TransactionModel({
    accountId: jsonMock.accountId,
    category: jsonMock.category.name,
    categoryId: jsonMock.categoryId,
    date: calendarDateToIso(jsonMock.date),
    description: jsonMock.description,
    id: jsonMock.id,
    owner: jsonMock.owner as OwnerType,
    ownerId: jsonMock.ownerId,
    type: jsonMock.type as TransactionType,
    value: "100.00",
  });
}

const spies = {};

const mocks = {
  json: jsonMock,
};

export { mocks, setup, spies };
