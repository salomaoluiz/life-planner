import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import { apiCardInvoice } from "@data/models/financial/mocks/CardInvoice.mocks";
import {
  apiCard,
  apiOverview,
} from "@data/models/financial/mocks/CreditCard.mocks";
import CardInvoiceEntity from "@domain/entities/financial/CardInvoiceEntity";
import CreditCardEntity, {
  CreditCardBrand,
} from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import cache, { CacheStringKeys } from "@infrastructure/cache";

import creditCardRepositoryImpl from "./creditCardRepositoryImpl";

const datasource = jest.mocked(datasourcesMocks.financialCreditCardDatasource);
const repository = creditCardRepositoryImpl(datasourcesMocks);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD create a card AND return the entity", async () => {
  datasource.createCreditCard.mockResolvedValueOnce(
    CreditCardModel.fromJSON(apiCard),
  );
  const params = {
    brand: CreditCardBrand.VISA,
    closingDay: 31,
    color: "#6366F1",
    dueDay: 10,
    limit: 500000,
    owner: OwnerType.USER,
    ownerId: "user-id",
    title: "Main card",
  };

  const result = await repository.createCreditCard(params);

  expect(datasource.createCreditCard).toHaveBeenCalledWith(params);
  expect(result).toBeInstanceOf(CreditCardEntity);
  expect(result.owner).toBe(OwnerType.USER);
  expect(result.limit).toBe(500000);
});

it("SHOULD list the cards as entities", async () => {
  datasource.getCreditCards.mockResolvedValueOnce([
    CreditCardModel.fromJSON(apiCard),
  ]);

  const result = await repository.getCreditCards(["a"]);

  expect(datasource.getCreditCards).toHaveBeenCalledWith(["a"]);
  expect(result[0]).toBeInstanceOf(CreditCardEntity);
});

it("SHOULD map the overview to entities (summaries and invoices)", async () => {
  datasource.getCreditCardsOverview.mockResolvedValueOnce(
    CreditCardOverviewModel.fromJSON(apiOverview),
  );

  const result = await repository.getCreditCardsOverview(["a"]);

  expect(result).toBeInstanceOf(CreditCardOverviewEntity);
  expect(result.aggregate.totalLimit).toBe(500000);
  expect(result.cards[0].card).toBeInstanceOf(CreditCardEntity);
  expect(result.cards[0].openInvoice.referenceMonth).toBe("2026-10");
  expect(result.cards[0].closedInvoices).toHaveLength(1);
});

it("SHOULD forward update params keeping null", async () => {
  await repository.updateCreditCard({ id: "c1", paymentDay: null });

  expect(datasource.updateCreditCard).toHaveBeenCalledWith({
    id: "c1",
    paymentDay: null,
  });
});

it("SHOULD forward only the id on delete", async () => {
  await repository.deleteCreditCard({ id: "c1" });

  expect(datasource.deleteCreditCard).toHaveBeenCalledWith({ id: "c1" });
});

describe("card invoices (spec 029)", () => {
  const cachedInvalidate = jest.spyOn(cache, "invalidate");

  beforeEach(() => cachedInvalidate.mockClear());

  it("SHOULD map the invoices of a month AND one invoice to entities", async () => {
    datasource.getCardInvoicesForMonth.mockResolvedValueOnce([
      CardInvoiceModel.fromJSON(apiCardInvoice),
    ]);
    datasource.getCardInvoice.mockResolvedValueOnce(
      CardInvoiceModel.fromJSON(apiCardInvoice),
    );

    const list = await repository.getCardInvoicesForMonth({
      month: "2026-11",
      ownerIds: ["a"],
    });
    const one = await repository.getCardInvoice({
      creditCardId: "c1",
      month: "2026-10",
    });

    expect(list[0]).toBeInstanceOf(CardInvoiceEntity);
    expect(list[0].card.owner).toBe(OwnerType.USER);
    expect(one.purchases).toHaveLength(1);
  });

  it("SHOULD invalidate the account and transaction caches after paying AND after undoing", async () => {
    await repository.payInvoice({
      accountId: "acc-1",
      creditCardId: "c1",
      method: "ACCOUNT",
      month: "2026-10",
      paidOn: "2026-11-05",
    });
    await repository.undoInvoicePayment({
      creditCardId: "c1",
      month: "2026-10",
    });

    expect(datasource.payInvoice).toHaveBeenCalledTimes(1);
    expect(datasource.undoInvoicePayment).toHaveBeenCalledTimes(1);
    expect(cachedInvalidate).toHaveBeenCalledWith(
      CacheStringKeys.CACHE_FINANCIAL_ACCOUNT_DATA,
    );
    expect(cachedInvalidate).toHaveBeenCalledTimes(4);
  });
});
