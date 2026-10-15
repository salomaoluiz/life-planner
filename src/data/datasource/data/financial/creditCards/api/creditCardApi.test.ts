import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import {
  apiCard,
  apiOverview,
} from "@data/models/financial/mocks/CreditCard.mocks";
import {
  ApiBusinessError,
  CreditCardHasTransactions,
  FieldInvalid,
  FinancialNotFound,
  FinancialOwnerNotAllowed,
  GenericError,
} from "@domain/entities/errors";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import createCreditCard from "./createCreditCard";
import deleteCreditCard from "./deleteCreditCard";
import getCreditCards from "./getCreditCards";
import getCreditCardsOverview from "./getCreditCardsOverview";
import updateCreditCard from "./updateCreditCard";

jest.mock("@infrastructure/api", () => ({
  api: { delete: jest.fn(), get: jest.fn(), patch: jest.fn(), post: jest.fn() },
}));

const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const createParams = {
  brand: CreditCardBrand.VISA,
  closingDay: 31,
  color: "#6366F1",
  dueDay: 10,
  lastDigits: "1234",
  limit: 500000,
  owner: OwnerType.USER,
  ownerId,
  paymentDay: 5,
  title: "Main card",
};

async function capture(promise: Promise<unknown>) {
  try {
    await promise;
  } catch (error) {
    return error;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createCreditCard", () => {
  it("SHOULD POST the body with the limit in cents AND return the model", async () => {
    jest.mocked(api.post).mockResolvedValueOnce(apiCard);

    const result = await createCreditCard(createParams);

    expect(api.post).toHaveBeenCalledWith("/v1/finance/credit-cards", {
      brand: "VISA",
      closingDay: 31,
      color: "#6366F1",
      dueDay: 10,
      lastDigits: "1234",
      limit: 500000,
      owner: "USER",
      ownerId,
      paymentDay: 5,
      title: "Main card",
    });
    expect(result).toEqual(CreditCardModel.fromJSON(apiCard));
  });

  it("SHOULD map 400 to FieldInvalid AND 403 to FinancialOwnerNotAllowed", async () => {
    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("Validation Failed", 400));
    expect(await capture(createCreditCard(createParams))).toBeInstanceOf(
      FieldInvalid,
    );

    jest
      .mocked(api.post)
      .mockRejectedValueOnce(new ApiBusinessError("Owner not accessible", 403));
    expect(await capture(createCreditCard(createParams))).toBeInstanceOf(
      FinancialOwnerNotAllowed,
    );
  });

  it("SHOULD wrap unknown errors in GenericError with the owner id only (never title or digits)", async () => {
    jest.mocked(api.post).mockRejectedValueOnce(new Error("boom"));

    const error = await capture(createCreditCard(createParams));

    expect(error).toBeInstanceOf(GenericError);
    expect(error).toHaveProperty("context", {
      datasource: "CreditCardDatasource - createCreditCard",
      error: expect.any(Error),
      ownerId,
    });
  });
});

describe("getCreditCards", () => {
  it("SHOULD GET with repeated ownerId params AND map the models", async () => {
    jest.mocked(api.get).mockResolvedValueOnce([apiCard]);

    const result = await getCreditCards(["a", "b"]);

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/credit-cards?ownerId=a&ownerId=b",
    );
    expect(result).toEqual([CreditCardModel.fromJSON(apiCard)]);
  });

  it("SHOULD NOT request anything WHEN there are no owners", async () => {
    expect(await getCreditCards([])).toEqual([]);
    expect(api.get).not.toHaveBeenCalled();
  });

  it("SHOULD wrap unknown errors in GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    expect(await capture(getCreditCards(["a"]))).toBeInstanceOf(GenericError);
  });
});

describe("getCreditCardsOverview", () => {
  it("SHOULD GET the overview endpoint AND map it", async () => {
    jest.mocked(api.get).mockResolvedValueOnce(apiOverview);

    const result = await getCreditCardsOverview(["a"]);

    expect(api.get).toHaveBeenCalledWith(
      "/v1/finance/credit-cards/overview?ownerId=a",
    );
    expect(result).toEqual(CreditCardOverviewModel.fromJSON(apiOverview));
  });

  it("SHOULD return an empty overview WITHOUT a request WHEN there are no owners", async () => {
    expect(await getCreditCardsOverview([])).toEqual(
      CreditCardOverviewModel.empty(),
    );
    expect(api.get).not.toHaveBeenCalled();
  });

  it("SHOULD wrap unknown errors in GenericError", async () => {
    jest.mocked(api.get).mockRejectedValueOnce(new Error("boom"));

    expect(await capture(getCreditCardsOverview(["a"]))).toBeInstanceOf(
      GenericError,
    );
  });
});

describe("updateCreditCard", () => {
  it("SHOULD PATCH only the defined fields AND keep null (clears)", async () => {
    await updateCreditCard({
      id: "card-1",
      paymentDay: null,
      title: "Renamed",
    });

    expect(api.patch).toHaveBeenCalledWith("/v1/finance/credit-cards/card-1", {
      paymentDay: null,
      title: "Renamed",
    });
  });

  it("SHOULD NOT send a request WHEN only the id is given", async () => {
    await updateCreditCard({ id: "card-1" });

    expect(api.patch).not.toHaveBeenCalled();
  });

  it("SHOULD map 404 to FinancialNotFound", async () => {
    jest
      .mocked(api.patch)
      .mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));

    expect(
      await capture(updateCreditCard({ id: "card-1", title: "x" })),
    ).toBeInstanceOf(FinancialNotFound);
  });
});

describe("deleteCreditCard", () => {
  it("SHOULD DELETE by id", async () => {
    await deleteCreditCard({ id: "card-1" });

    expect(api.delete).toHaveBeenCalledWith("/v1/finance/credit-cards/card-1");
  });

  it("SHOULD map 409 to CreditCardHasTransactions AND 404 to FinancialNotFound", async () => {
    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Conflict", 409));
    expect(await capture(deleteCreditCard({ id: "card-1" }))).toBeInstanceOf(
      CreditCardHasTransactions,
    );

    jest
      .mocked(api.delete)
      .mockRejectedValueOnce(new ApiBusinessError("Not Found", 404));
    expect(await capture(deleteCreditCard({ id: "card-1" }))).toBeInstanceOf(
      FinancialNotFound,
    );
  });
});
