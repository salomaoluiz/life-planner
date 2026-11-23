import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import { StockBarcodeMatchDTO } from "@application/dto/stock/StockBarcodeDTO";
import { StockBarcodeInvalid } from "@domain/entities/errors";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { vibrateOnScan } from "@infrastructure/barcodeScanner";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useStockBarcodeViewModel from "./useStockBarcodeViewModel";

const mockQuick = {
  commit: jest.fn(),
  onOpen: jest.fn(),
  onStep: jest.fn(),
  settled: undefined as (() => Promise<unknown> | void) | undefined,
};

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@infrastructure/barcodeScanner", () => ({
  useScannerPermission: jest.fn(() => ({
    request: jest.fn(),
    status: "granted",
  })),
  vibrateOnScan: jest.fn(),
}));
jest.mock("@screens/Stock/hooks/useStockQuickMovement", () => ({
  __esModule: true,
  default: (options: { onSettled: () => Promise<unknown> | void }) => {
    mockQuick.settled = options.onSettled;

    return mockQuick;
  },
}));
jest.mock("@presentation/i18n/useTranslationLocale", () => ({
  __esModule: true,
  default: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    addPurchaseRowByCodeUseCase: { execute: jest.fn(), uniqueName: "by_code" },
    getFrequentStockItemsUseCase: {
      execute: jest.fn(),
      uniqueName: "frequent",
    },
    getPurchaseUseCase: { execute: jest.fn(), uniqueName: "purchase" },
    getStockItemsUseCase: { execute: jest.fn(), uniqueName: "items" },
    lookupStockBarcodeUseCase: { execute: jest.fn(), uniqueName: "lookup" },
  },
}));

const mutationFixture = new UseMutationFixture<unknown, unknown>();
const byCodeFixture = new UseMutationFixture<unknown, unknown>();
const item = dto((f) =>
  f.withId("item-1").withUnit(StockUnits.UNIT).withDescription("Milk"),
);

// The lookup mutation in another state (the by-code one stays idle).
function lookupState(
  mutation: ReturnType<typeof mutationFixture.build>,
  state: object,
) {
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      props.cacheKey[0] === "by_code"
        ? byCodeFixture.reset().build()
        : { ...mutation, ...state }) as never);
}

function match(ownerId: string, readOnly = false): StockBarcodeMatchDTO {
  return { item, owner: "USER", ownerId, ownerName: ownerId, readOnly };
}

function setup(
  params: Record<string, string | undefined> = {},
  mutation = mutationFixture.reset().build(),
  byCode = byCodeFixture.reset().build(),
) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params as never);
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      props.cacheKey[0] === "by_code" ? byCode : mutation) as never);

  return { ...renderHook(() => useStockBarcodeViewModel()), mutation };
}

// A lookup that finished: the hook reads `data` when `status` flips to success.
function withResult(
  matches: StockBarcodeMatchDTO[],
  params: Record<string, string | undefined> = {},
) {
  const mutation = mutationFixture.reset().build();
  const hook = setup(params, mutation);

  act(() => hook.result.current.onTypedChange("7891000100103"));
  act(() => hook.result.current.onSubmitTyped());
  const answered = {
    ...mutation,
    data: { code: "7891000100103", matches },
    status: "success",
  };

  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      props.cacheKey[0] === "by_code"
        ? byCodeFixture.reset().build()
        : answered) as never);
  hook.rerender({});

  return hook;
}

beforeEach(() => jest.clearAllMocks());

describe("search", () => {
  it("SHOULD look up the cleaned typed code", () => {
    const { mutation, result } = setup();

    act(() => result.current.onTypedChange(" 7891000-100103 "));
    act(() => result.current.onSubmitTyped());

    expect(mutation.mutate).toHaveBeenCalledWith({ code: "7891000100103" });
  });

  it("SHOULD show 'not recognized' WITHOUT calling the API WHEN the text is not a code", () => {
    const { mutation, result } = setup();

    act(() => result.current.onTypedChange("a$b"));
    act(() => result.current.onSubmitTyped());

    expect(mutation.mutate).not.toHaveBeenCalled();
    expect(result.current.message).toBe("notRecognized");
  });

  it("SHOULD map an invalid-code answer to 'not recognized' AND any other failure to 'failed'", () => {
    const { mutation, rerender, result } = setup();

    lookupState(mutation, {
      error: new StockBarcodeInvalid(),
      status: "error",
    });
    rerender({});
    expect(result.current.message).toBe("notRecognized");

    lookupState(mutation, {
      error: new Error("x"),
      status: "idle",
    });
    rerender({});
    lookupState(mutation, {
      error: new Error("x"),
      status: "error",
    });
    rerender({});
    expect(result.current.message).toBe("failed");
  });
});

describe("result", () => {
  it("SHOULD open the new item form with the code WHEN nobody has it", () => {
    withResult([], { ownerId: "owner-1" });

    expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
      "add_new_stock_item",
      { barcode: "7891000100103", ownerId: "owner-1" },
    );
  });

  it("SHOULD open the quick sheet WHEN one owner has it", () => {
    const { result } = withResult([match("owner-1")]);

    expect(result.current.sheet?.name).toBe("Milk");
    expect(result.current.showsOwnerPicker).toBe(false);
    expect(result.current.paused).toBe(true);
  });

  it("SHOULD ask which stock WHEN two owners have it AND skip the question WHEN the filter owner is one of them", () => {
    const asked = withResult([match("owner-1"), match("owner-2")]);

    expect(asked.result.current.showsOwnerPicker).toBe(true);
    expect(asked.result.current.matches).toHaveLength(2);

    act(() => asked.result.current.onPickOwner(1));
    expect(asked.result.current.sheet?.ownerName).toBe("owner-2");

    const filtered = withResult([match("owner-1"), match("owner-2")], {
      ownerId: "owner-2",
    });

    expect(filtered.result.current.showsOwnerPicker).toBe(false);
    expect(filtered.result.current.sheet?.ownerName).toBe("owner-2");
  });
});

describe("sheet actions", () => {
  it("SHOULD move the item through the quick engine WITH the step AND scan on", () => {
    const { result } = withResult([match("owner-1")]);

    act(() => result.current.onAction(-1));

    expect(mockQuick.onStep).toHaveBeenCalledWith(item, -1, 1);
    expect(mockQuick.commit).toHaveBeenCalled();
    expect(result.current.sheet).toBeUndefined();
    expect(result.current.typed).toBe("");
  });

  it("SHOULD open the item through the quick engine", () => {
    const { result } = withResult([match("owner-1")]);

    act(() => result.current.onOpen());

    expect(mockQuick.onOpen).toHaveBeenCalledWith(item);
  });

  it("SHOULD do nothing on a read-only owner", () => {
    const { result } = withResult([match("owner-1", true)]);

    act(() => result.current.onAction(1));
    act(() => result.current.onOpen());

    expect(mockQuick.onStep).not.toHaveBeenCalled();
    expect(mockQuick.onOpen).not.toHaveBeenCalled();
  });

  it("SHOULD go back to scanning WHEN 'scan another' is chosen", () => {
    const { result } = withResult([match("owner-1")]);

    act(() => result.current.onScanAnother());

    expect(result.current.sheet).toBeUndefined();
    expect(result.current.paused).toBe(false);
  });

  it("SHOULD open the details of the item in the stock list", () => {
    const { result } = withResult([match("owner-1")]);

    act(() => result.current.onOpenDetail());

    expect(modalNavigation.closeModal).toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/stock?item=item-1");
  });

  it("SHOULD refresh the stock lists once a movement settles", async () => {
    setup();

    await mockQuick.settled?.();

    expect(invalidateFetcherData).toHaveBeenCalledWith(["items", "frequent"]);
  });
});

describe("scanning", () => {
  it("SHOULD vibrate AND look the code up", () => {
    const { mutation, result } = setup();

    act(() => result.current.onScan({ code: "7891000100103", type: "ean13" }));

    expect(vibrateOnScan).toHaveBeenCalled();
    expect(mutation.mutate).toHaveBeenCalledWith({ code: "7891000100103" });
  });

  it("SHOULD expand a UPC-E before the lookup", () => {
    const { mutation, result } = setup();

    act(() => result.current.onScan({ code: "04252614", type: "upc_e" }));

    expect(mutation.mutate).toHaveBeenCalledWith({ code: "042100005264" });
  });

  it("SHOULD ignore reads while a result is shown", () => {
    const { mutation, result } = withResult([match("owner-1")]);

    jest.mocked(mutation.mutate).mockClear();
    act(() => result.current.onScan({ code: "7891000100103", type: "ean13" }));

    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD open the location of a location QR instead of looking a code up", () => {
    process.env.EXPO_PUBLIC_PROJECT_WEBSITE_URL = "https://app.example.com";
    const base = "https://app.example.com";
    const { mutation, result } = setup();

    act(() =>
      result.current.onScan({
        code: `${base}/stock/locations/loc-1`,
        type: "qr",
      }),
    );

    expect(mutation.mutate).not.toHaveBeenCalled();
    expect(router.push).toHaveBeenCalledWith("/stock/locations/loc-1");
    expect(modalNavigation.closeModal).toHaveBeenCalled();
  });

  it("SHOULD say 'not recognized' for a QR that is not a code", () => {
    const { mutation, result } = setup();

    act(() => result.current.onScan({ code: "hello world!", type: "qr" }));

    expect(mutation.mutate).not.toHaveBeenCalled();
    expect(result.current.message).toBe("notRecognized");
  });
});

describe("code param", () => {
  it("SHOULD look the code up on open", () => {
    const { mutation } = setup({ code: "7891000100103" });

    expect(mutation.mutate).toHaveBeenCalledWith({ code: "7891000100103" });
  });
});

describe("shopping mode (spec 121 FR 25)", () => {
  it("SHOULD add the code to the purchase instead of looking the item up", () => {
    const byCode = byCodeFixture.reset().build();
    const { mutation, result } = setup(
      { purchaseId: "purchase-1" },
      undefined,
      byCode,
    );

    act(() => result.current.onScan({ code: "7891000100103", type: "ean13" }));

    expect(byCode.mutate).toHaveBeenCalledWith({
      clientId: expect.any(String),
      code: "7891000100103",
      purchaseId: "purchase-1",
    });
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD show the row that was added, marked as suggested WHEN it did not come from an item", () => {
    const byCode = byCodeFixture.reset().build();
    const { rerender, result } = setup(
      { purchaseId: "purchase-1" },
      undefined,
      byCode,
    );

    jest.mocked(useMutation).mockImplementation(((props: {
      cacheKey: string[];
    }) =>
      props.cacheKey[0] === "by_code"
        ? {
            ...byCode,
            data: { row: { description: "Café" }, source: "OPEN_FOOD_FACTS" },
            status: "success",
          }
        : mutationFixture.reset().build()) as never);
    rerender({});

    expect(result.current.added).toEqual({ name: "Café", suggested: true });
    expect(invalidateFetcherData).toHaveBeenCalledWith(["purchase"]);
  });

  it("SHOULD say it failed WHEN the API refuses", () => {
    const byCode = byCodeFixture.reset().build();
    const { rerender, result } = setup(
      { purchaseId: "purchase-1" },
      undefined,
      byCode,
    );

    jest
      .mocked(useMutation)
      .mockImplementation(((props: { cacheKey: string[] }) =>
        props.cacheKey[0] === "by_code"
          ? { ...byCode, status: "error" }
          : mutationFixture.reset().build()) as never);
    rerender({});

    expect(result.current.message).toBe("failed");
  });
});
