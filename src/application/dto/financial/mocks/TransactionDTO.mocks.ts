import TransactionEntity, {
  TransactionOwners,
  TransactionType,
} from "@domain/entities/financial/TransactionEntity";

import TransactionDTO, { ITransactionDTO } from "../TransactionDTO";

// region mocks
const defaultProps: ITransactionDTO = {
  category: "Food",
  date: new Date(2023, 1, 1).toISOString(),
  description: "Test transaction",
  id: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  owner: TransactionOwners.FAMILY,
  ownerId: "4be16cb6-b9e4-47bb-99cb-eb62ff6576c3",
  type: TransactionType.EXPENSE,
  value: "100.0",
};

const defaultTransactionEntity = new TransactionEntity({
  category: defaultProps.category,
  date: defaultProps.date,
  description: defaultProps.description,
  id: defaultProps.id,
  owner: defaultProps.owner as TransactionOwners,
  ownerId: defaultProps.ownerId,
  type: defaultProps.type as TransactionType,
  value: defaultProps.value,
});
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(entity: TransactionEntity = defaultTransactionEntity) {
  return TransactionDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
