import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";

import getInvestmentsSummaryUseCase from "../getInvestmentsSummaryUseCase";

// region mocks

const entity: InvestmentsHomeSummary = {
  currentValueCents: 18432055,
  hasPositions: true,
  income: {
    count: 6,
    month: "2026-11",
    pendingSuggestions: 2,
    totalCents: 128430,
  },
  investedCents: 16290000,
  quotes: { manualCount: 2, stale: false, withoutPrice: 0 },
  resultBasisPoints: 1315,
  resultCents: 2142055,
};
const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

// endregion mocks

const investmentRepositorySpy = jest.mocked(
  repositoriesMocks.investmentRepository,
);

beforeEach(() => {
  jest.clearAllMocks();
  investmentRepositorySpy.getHomeSummary.mockResolvedValue(entity);
});

async function setup(ownerIds: string[] = ["owner-id"], today = "2026-11-04") {
  return getInvestmentsSummaryUseCase(repositoriesMocks).execute({
    ownerIds,
    today,
  });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { investmentRepository: investmentRepositorySpy };
const mocks = {
  entity,
  errors: { business: businessError, unknown: unknownError },
};

export { mocks, setup, setupThrowable, spies };
