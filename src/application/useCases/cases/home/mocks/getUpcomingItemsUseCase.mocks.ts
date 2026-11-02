import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import { UpcomingEntity } from "@domain/entities/financial/UpcomingEntity";

import getUpcomingItemsUseCase from "../getUpcomingItemsUseCase";

// region mocks

const entity: UpcomingEntity = {
  next: [],
  nextTotal: 7,
  overdue: [
    {
      accountId: "account-id",
      categoryId: "category-id",
      creditCardId: null,
      currency: "BRL",
      date: "2026-10-28",
      description: "Condo",
      id: "transaction-id",
      invoiceMonth: null,
      kind: "TRANSACTION",
      occurrenceNumber: null,
      owner: "USER",
      ownerId: "owner-id",
      purchaseCount: null,
      recurrenceId: null,
      type: "EXPENSE",
      valueCents: 65000,
    },
  ],
  overdueTotals: { expenseCents: 317000, incomeCents: 0 },
};
const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

// endregion mocks

// region spies

const upcomingRepositorySpy = jest.mocked(
  repositoriesMocks.financialRepository.upcoming,
);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  upcomingRepositorySpy.getUpcoming.mockResolvedValue(entity);
});

async function setup(ownerIds: string[] = ["owner-id"]) {
  return getUpcomingItemsUseCase(repositoriesMocks).execute({ ownerIds });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { upcomingRepository: upcomingRepositorySpy };
const mocks = {
  entity,
  errors: { business: businessError, unknown: unknownError },
};

export { mocks, setup, setupThrowable, spies };
