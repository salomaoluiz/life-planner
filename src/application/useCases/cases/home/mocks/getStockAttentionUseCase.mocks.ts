import { repositoriesMocks } from "@data/repositories/mocks/index.mocks";
import { BusinessError } from "@domain/entities/errors";
import StockEntityFixture from "@domain/entities/stock/mocks/StockEntity.fixture";
import { StockExpirationStatus } from "@domain/entities/stock/StockEntity";

import getStockAttentionUseCase, {
  GetStockAttentionUseCaseParams,
} from "../getStockAttentionUseCase";

// region mocks

// Monday 2026-10-05, afternoon: day boundaries must ignore the time of day.
const now = new Date(2026, 9, 5, 15, 30);

const ownerIds = [
  "02614b7d-d6d7-4f4f-98e9-23c193bd539c",
  "f3a2b0d4-5c7e-4b8e-8f1c-6a9d1f2b3c4d",
];

// `expiresInDays` is the nearest effective expiration; the status follows the API rule (7 days closed).
function item(id: string, expiresInDays?: number, needsRestock = false) {
  const fixture = new StockEntityFixture()
    .withDefault()
    .withId(id)
    .withDescription(`Item ${id}`)
    .withNeedsRestock(needsRestock);

  if (expiresInDays !== undefined) {
    fixture.withNearestExpiration(
      new Date(2026, 9, 5 + expiresInDays, 0, 0, 0),
    );

    if (expiresInDays < 0) {
      fixture.withExpirationStatus(StockExpirationStatus.EXPIRED);
    } else if (expiresInDays <= 7) {
      fixture.withExpirationStatus(StockExpirationStatus.EXPIRING);
    } else {
      fixture.withExpirationStatus(StockExpirationStatus.OK);
    }
  }

  return fixture.build();
}

const unknownError = new Error("Some error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_value" });

// endregion mocks

// region spies

const stockRepositorySpy = jest.mocked(repositoriesMocks.stockRepository);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  stockRepositorySpy.getStockItems.mockResolvedValue([]);
});

async function setup(params: Partial<GetStockAttentionUseCaseParams> = {}) {
  return getStockAttentionUseCase(repositoriesMocks).execute({
    now,
    ownerIds,
    ...params,
  });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { stockRepository: stockRepositorySpy };

const mocks = {
  errors: { business: businessError, unknown: unknownError },
  item,
  now,
  ownerIds,
};

export { mocks, setup, setupThrowable, spies };
