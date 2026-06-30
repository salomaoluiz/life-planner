import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import AccountEntity, {
  AccountStatus,
} from "@domain/entities/financial/AccountEntity";
import CategoryEntity from "@domain/entities/financial/CategoryEntity";
import TransactionEntityFixture from "@domain/entities/financial/mocks/TransactionEntity.fixture";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import getTransactionsUseCase, {
  GetTransactionsUseCaseParams,
} from "../getTransactionsUseCase";

// region mocks
const defaultParams: GetTransactionsUseCaseParams = {
  ownerIds: [
    "a02fc555-758a-419b-bfa9-b27799db926d",
    "e3ff764d-c31f-4739-8f25-9f31ab8b7a8b",
  ],
};

const transactionEntityFixture = new TransactionEntityFixture().withDefault();

const transactionEntitiesMock = [
  transactionEntityFixture
    .withId("7725d480-faff-4139-a62b-b69c3702aed2")
    .build(),
  transactionEntityFixture
    .withId("7725d480-faff-4139-a62b-b69c3702aed2")
    .build(),
];

const categoriesMock = [
  new CategoryEntity({
    icon: "cart",
    id: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
    name: "Shopping",
    owner: OwnerType.FAMILY,
    ownerId: "b11923e6-bfbb-4965-b3f6-a075249d1e63",
  }),
];

const accountsMock = [
  new AccountEntity({
    balance: 1000,
    icon: "bank",
    id: "c5598687-dfeb-485e-990a-a035d8e7d23d",
    name: "Main Account",
    owner: OwnerType.FAMILY,
    ownerId: "b11923e6-bfbb-4965-b3f6-a075249d1e63",
    status: AccountStatus.ACTIVE,
  }),
];

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({
  any_context: "any_value",
});

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(params?: Partial<GetTransactionsUseCaseParams>) {
  return getTransactionsUseCase(repositoriesMocks).execute({
    ...defaultParams,
    ...params,
  });
}

async function setupThrowable(params?: Partial<GetTransactionsUseCaseParams>) {
  try {
    await setup(params);
  } catch (err) {
    return err;
  }
}

const spies = {
  financialRepositoryAccount: jest.mocked(
    repositoriesMocks.financialRepository.account,
  ),
  financialRepositoryCategory: jest.mocked(
    repositoriesMocks.financialRepository.category,
  ),
  financialRepositoryTransaction: jest.mocked(
    repositoriesMocks.financialRepository.transaction,
  ),
};

const mocks = {
  accounts: accountsMock,
  categories: categoriesMock,
  defaultParams,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
  transactionEntities: transactionEntitiesMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
