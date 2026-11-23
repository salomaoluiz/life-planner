import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { useCases } from "@application/useCases";
import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { PurchaseRowStates } from "@domain/entities/stock/PurchaseEntity";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import useOwners from "@presentation/hooks/useOwners";

import usePurchaseCloseViewModel from "./usePurchaseCloseViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@infrastructure/uuid", () => ({ uuidv4: () => "close-key" }));
jest.mock("@application/useCases", () => ({
  useCases: {
    closePurchaseUseCase: { execute: jest.fn(), uniqueName: "close" },
    closingLockUseCase: { execute: jest.fn(), uniqueName: "lock" },
    getClosePreviewUseCase: { execute: jest.fn(), uniqueName: "preview" },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getFinancialCreditCardsUseCase: { execute: jest.fn(), uniqueName: "cards" },
    getPurchaseUseCase: { execute: jest.fn(), uniqueName: "purchase" },
    getShoppingListUseCase: { execute: jest.fn(), uniqueName: "detail" },
  },
}));

const queries: Record<string, Record<string, unknown>> = {};

function row(id: string, extra: Record<string, unknown> = {}) {
  return {
    checkedAt: "2026-11-18T10:00:00.000Z",
    description: id,
    id,
    quantity: 2,
    state: PurchaseRowStates.IN_CART,
    unit: StockUnits.UNIT,
    unknownPrice: false,
    ...extra,
  };
}

function setup() {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "p1" });
  jest.mocked(useOwners).mockReturnValue({ data: [{ id: "u" }] } as never);
  jest.mocked(useQuery).mockImplementation(((props: {
    cacheKey: string[];
  }) => ({
    data: undefined,
    isFetching: false,
    ...queries[props.cacheKey[0]],
  })) as never);

  return renderHook(() => usePurchaseCloseViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
  Object.keys(queries).forEach((key) => delete queries[key]);
  queries.purchase = {
    data: {
      purchase: { currency: "BRL", id: "p1", listId: "l1", marketId: "m1" },
      rows: [
        row("r1", { lineTotalCents: 600 }),
        row("r2"),
        row("gone", { state: PurchaseRowStates.NOT_FOUND }),
      ],
    },
  };
  queries.preview = {
    data: {
      expirations: [{ rowId: "r1", suggestedDate: "2026-12-10" }],
      financeParts: [{ categoryId: "cat", kind: "CATEGORY", valueCents: 1000 }],
      missingPrices: ["r2"],
      needsDefaultFinanceCategory: true,
      newItems: [
        {
          description: "Candle",
          rowId: "r2",
          suggestion: { description: "Vela", itemId: "vela" },
        },
      ],
      unknownWeight: [],
    },
  };
  queries.detail = { data: { list: { id: "l1", ownerId: "u" } } };
  queries.accounts = {
    data: [
      {
        currency: "BRL",
        id: "a1",
        name: "Checking",
        ownerId: "u",
        status: "ACTIVE",
      },
      {
        currency: "USD",
        id: "a2",
        name: "Dollar",
        ownerId: "u",
        status: "ACTIVE",
      },
      {
        currency: "BRL",
        id: "a3",
        name: "Old",
        ownerId: "u",
        status: "ARCHIVED",
      },
    ],
  };
  queries.cards = {
    data: [
      {
        currency: "BRL",
        id: "c1",
        ownerId: "u",
        status: "ACTIVE",
        title: "Visa",
      },
    ],
  };
  queries.categories = {
    data: [
      { id: "cat", name: "Food", status: "ACTIVE", type: "EXPENSE" },
      { id: "inc", name: "Salary", status: "ACTIVE", type: "INCOME" },
    ],
  };
  jest
    .mocked(useCases.closingLockUseCase.execute)
    .mockResolvedValue(undefined as never);
  jest
    .mocked(useCases.closePurchaseUseCase.execute)
    .mockResolvedValue({} as never);
});

describe("steps", () => {
  it("SHOULD list the four steps WHEN there are new items AND expirations", () => {
    const { result } = setup();

    expect(result.current.steps).toEqual([
      "prices",
      "newItems",
      "expirations",
      "payment",
    ]);
    expect(result.current.step).toBe("prices");
    expect(result.current.rows.map((entry) => entry.id)).toEqual(["r1", "r2"]);
    expect(result.current.accountOptions.map((account) => account.id)).toEqual([
      "a1",
    ]);
    expect(result.current.cardOptions).toHaveLength(1);
    expect(
      result.current.expenseCategories.map((category) => category.id),
    ).toEqual(["cat"]);
  });

  it("SHOULD hold the lock while open AND release it on leave", async () => {
    const { unmount } = setup();

    await act(async () => undefined);
    expect(useCases.closingLockUseCase.execute).toHaveBeenCalledWith({
      id: "p1",
    });

    unmount();
    expect(useCases.closingLockUseCase.execute).toHaveBeenCalledWith({
      id: "p1",
      release: true,
    });
  });

  it("SHOULD mark the wizard as taken WHEN another member holds the lock", async () => {
    jest
      .mocked(useCases.closingLockUseCase.execute)
      .mockRejectedValueOnce(new Error("409"));

    const { result } = setup();

    await act(async () => undefined);

    expect(result.current.lockedBy).toBe(true);
  });

  it("SHOULD refuse to continue WHEN the receipt leaves a row unpriced AND go on once priced", () => {
    const { result } = setup();

    act(() => result.current.onReceiptChange(1000));
    act(() => result.current.onContinue());
    // r2 has no price and is not "unknown": the single row receives the rest, so it can continue.
    expect(result.current.step).toBe("newItems");

    act(() => result.current.onBackStep());
    expect(result.current.step).toBe("prices");
    act(() => result.current.onReceiptChange(500));
    act(() => result.current.onContinue());
    expect(result.current.errorKey).toBe("stock.close.errorPrice");
  });

  it("SHOULD go back out of the wizard from the first step", () => {
    const { result } = setup();

    act(() => result.current.onBackStep());

    expect(router.back).toHaveBeenCalled();
  });

  it("SHOULD require the weight of kg/L rows", () => {
    queries.preview = {
      data: { ...(queries.preview.data as object), unknownWeight: ["r2"] },
    };

    const { result } = setup();

    act(() => result.current.onReceiptChange(1000));
    act(() => result.current.onContinue());
    expect(result.current.errorKey).toBe("stock.close.errorWeight");

    act(() => result.current.onWeightChange("r2", "0,82"));
    act(() => result.current.onContinue());
    expect(result.current.errorKey).toBeUndefined();
  });
});

describe("closing", () => {
  function toPayment(result: {
    current: ReturnType<typeof usePurchaseCloseViewModel>;
  }) {
    act(() => result.current.onReceiptChange(1000));
    act(() => result.current.onMatch("r2", "vela"));
    act(() => result.current.onExpirationToggle("r1"));
    act(() => result.current.onContinue());
    act(() => result.current.onContinue());
    act(() => result.current.onContinue());
  }

  it("SHOULD post ONE close with the matches, the accepted expirations AND the source", async () => {
    const { result } = setup();

    toPayment(result);
    expect(result.current.step).toBe("payment");

    act(() => result.current.onSourceChange({ id: "a1", type: "ACCOUNT" }));
    act(() => result.current.onDefaultCategoryChange("cat"));
    act(() => result.current.onDateChange("2026-11-18"));
    await act(async () => result.current.onFinish());

    expect(useCases.closePurchaseUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        accountId: "a1",
        clientId: "close-key",
        creditCardId: undefined,
        date: "2026-11-18",
        defaultFinanceCategoryId: "cat",
        id: "p1",
        receiptTotalCents: 1000,
        rows: [
          expect.objectContaining({
            expirationDate: "2026-12-10",
            rowId: "r1",
          }),
          expect.objectContaining({ itemId: "vela", rowId: "r2" }),
        ],
      }),
    );
    expect(invalidateFetcherData).toHaveBeenCalled();
    expect(router.replace).toHaveBeenCalledWith("/stock/list/l1");
  });

  it("SHOULD ask the default finance category on the payment step", async () => {
    const { result } = setup();

    toPayment(result);
    act(() => result.current.onSourceChange({ id: "c1", type: "CARD" }));
    await act(async () => result.current.onFinish());

    expect(result.current.errorKey).toBe("stock.close.errorDefault");
    expect(useCases.closePurchaseUseCase.execute).not.toHaveBeenCalled();
  });

  it("SHOULD send typed prices, the weight AND the unknown flag", async () => {
    const { result } = setup();

    toPayment(result);
    act(() => result.current.onPriceChange("r2", 250));
    act(() => result.current.onWeightChange("r2", "1,5"));
    act(() => result.current.onUnknownToggle("r1"));
    act(() => result.current.onSourceChange({ id: "a1", type: "ACCOUNT" }));
    act(() => result.current.onDefaultCategoryChange("cat"));
    await act(async () => result.current.onFinish());

    const rows = jest.mocked(useCases.closePurchaseUseCase.execute).mock
      .calls[0][0].rows;

    expect(rows[0]).toMatchObject({ rowId: "r1", unknownPrice: true });
    expect(rows[1]).toMatchObject({
      quantity: 1.5,
      rowId: "r2",
      unitPriceCents: 250,
    });
  });

  it("SHOULD map the closing codes of the API to messages AND lock on PURCHASE_CLOSING", async () => {
    const { result } = setup();

    toPayment(result);
    act(() => result.current.onSourceChange({ id: "a1", type: "ACCOUNT" }));
    act(() => result.current.onDefaultCategoryChange("cat"));

    function failWith(code?: string) {
      jest.mocked(useCases.closePurchaseUseCase.execute).mockRejectedValueOnce(
        Object.assign(new GenericError(), {
          context: {
            error: new ApiBusinessError("x", 422, {}, code ? { code } : {}),
          },
        }),
      );
    }

    failWith("PURCHASE_TOTAL_BELOW_ITEMS");
    await act(async () => result.current.onFinish());
    expect(result.current.errorKey).toBe("stock.close.errorPrice");

    failWith("PURCHASE_WEIGHT_REQUIRED");
    await act(async () => result.current.onFinish());
    expect(result.current.errorKey).toBe("stock.close.errorWeight");

    failWith("PURCHASE_CLOSING");
    await act(async () => result.current.onFinish());
    expect(result.current.lockedBy).toBe(true);
    expect(result.current.errorKey).toBe("stock.purchase.errorSave");

    jest
      .mocked(useCases.closePurchaseUseCase.execute)
      .mockRejectedValueOnce(new Error("boom"));
    await act(async () => result.current.onFinish());
    expect(result.current.errorKey).toBe("stock.purchase.errorSave");
  });
});
