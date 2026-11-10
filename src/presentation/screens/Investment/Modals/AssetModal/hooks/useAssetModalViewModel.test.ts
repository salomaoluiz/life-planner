import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  QuoteSourceUnavailable,
  TickerExists,
  TickerNotFound,
} from "@domain/entities/errors";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentTickerSuggestion,
} from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeDetail, owners } from "@screens/Investment/mocks/fixtures";

import useAssetModalViewModel from "./useAssetModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "create" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    searchInvestmentTickersUseCase: {
      execute: jest.fn(),
      uniqueName: "search",
    },
    updateInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();
const searchQuery = new UseQueryFixture<InvestmentTickerSuggestion[]>();

const spies = {
  activeOwners: jest.mocked(useActiveOwners),
  allOwners: jest.mocked(useOwners),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  detailQuery.reset();
  ownersQuery.reset().withData(owners);
  createMutation.reset();
  updateMutation.reset();
  searchQuery.reset();
  spies.params.mockReturnValue({});
  spies.activeOwners.mockReturnValue(ownersQuery.build() as never);
  spies.allOwners.mockReturnValue(ownersQuery.build() as never);
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) =>
    props.cacheKey.includes("ticker-search")
      ? searchQuery.build()
      : detailQuery.build()) as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    (props.cacheKey[0] === "create"
      ? createMutation
      : updateMutation
    ).build()) as never);
});

function setup() {
  return renderHook(() => useAssetModalViewModel());
}

it("SHOULD start a new asset for the personal owner", () => {
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.ownerId).toBe("user-1");
  expect(result.current.assetClass).toBe(InvestmentAssetClass.BR_STOCK);
  expect(result.current.classOptions).toHaveLength(5);
  expect(result.current.titleKey).toBe("investment.form.asset.newTitle");
});

it("SHOULD be loading until the owners arrive", () => {
  ownersQuery.reset();
  spies.activeOwners.mockReturnValue(ownersQuery.build() as never);

  expect(setup().result.current.isLoading).toBe(true);
});

it("SHOULD validate before creating AND create with the typed values", () => {
  const { result } = setup();

  act(() => result.current.onSave());
  expect(result.current.nameError).toBeDefined();
  expect(createMutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onAssetClassChange("PRIVATE"));
  act(() => result.current.onTickerChange("itsa4"));
  act(() => result.current.onCurrentValueChange("10,53"));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      assetClass: "PRIVATE",
      currentUnitPrice: "10,53",
      name: "ITSA4",
      owner: "USER",
      ticker: "ITSA4",
    }),
  );
});

it("SHOULD suggest the currency by class AND let the user pick one", () => {
  const { result } = setup();

  act(() => result.current.onAssetClassChange("FOREIGN_STOCK"));
  expect(result.current.currency).toBe("USD");

  act(() => result.current.onCurrencyChange("EUR"));
  act(() => result.current.onAssetClassChange("BR_STOCK"));
  // A quoted class takes the currency of its market and locks it (spec 104 FR 24).
  expect(result.current.currency).toBe("BRL");
  expect(result.current.currencyReadOnly).toBe(true);
  act(() => result.current.onAssetClassChange("PRIVATE"));
  act(() => result.current.onCurrencyChange("EUR"));
  expect(result.current.currency).toBe("EUR");
  expect(result.current.currencyReadOnly).toBe(false);
  expect(result.current.currencyOptions).toEqual(["BRL", "USD", "EUR"]);
});

it("SHOULD change the name and owner", () => {
  const { result } = setup();

  act(() => result.current.onNameChange("Itaúsa"));
  act(() => result.current.onOwnerChange("fam-1"));

  expect(result.current.name).toBe("Itaúsa");
  expect(result.current.ownerId).toBe("fam-1");
});

it("SHOULD close, invalidate and reset WHEN the create succeeds", () => {
  createMutation.withStatus("success");

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD show the duplicated ticker under the ticker field", () => {
  createMutation.withError(new TickerExists() as never);

  const { result } = setup();

  expect(result.current.tickerError).toBe("investment.errors.tickerExists");
  expect(result.current.failure).toBeUndefined();
});

it("SHOULD show other failures at the end of the form", () => {
  updateMutation.withError();

  expect(setup().result.current.failure?.key).toBe("common.errors.generic");
});

describe("editing", () => {
  beforeEach(() => {
    spies.params.mockReturnValue({ id: "asset-1" });
    detailQuery.withData(makeDetail());
  });

  it("SHOULD load the asset AND lock class and currency after the first operation", () => {
    const { result } = setup();

    expect(result.current.isEditing).toBe(true);
    expect(result.current.ticker).toBe("ITSA4");
    expect(result.current.classLocked).toBe(true);
    expect(result.current.titleKey).toBe("investment.form.asset.editTitle");
  });

  it("SHOULD send only the changes AND close without a request WHEN nothing changed", () => {
    const { result } = setup();

    act(() => result.current.onSave());
    expect(updateMutation.value.mutate).not.toHaveBeenCalled();
    expect(modalNavigation.closeModal).toHaveBeenCalled();

    act(() => result.current.onNameChange("Itaúsa ON"));
    act(() => result.current.onSave());
    expect(updateMutation.value.mutate).toHaveBeenCalledWith({
      id: "asset-1",
      name: "Itaúsa ON",
    });
  });

  it("SHOULD report a missing asset", () => {
    detailQuery.reset().withError();

    expect(setup().result.current.isNotFound).toBe(true);
  });

  it("SHOULD ask before discarding a dirty form", () => {
    const { result } = setup();

    act(() => result.current.onClose());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

    act(() => result.current.onNameChange("Changed"));
    act(() => result.current.onClose());
    expect(result.current.discardOpen).toBe(true);

    act(() => result.current.onDiscardCancel());
    expect(result.current.discardOpen).toBe(false);
    act(() => result.current.onDiscardConfirm());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
  });

  it("SHOULD NOT lock the class WHEN the asset has no operation", () => {
    detailQuery.withData(makeDetail({ operationCount: 0 }));

    expect(setup().result.current.classLocked).toBe(false);
  });
});

const itsa: InvestmentTickerSuggestion = {
  changePercent: "0.48",
  currency: "BRL",
  exchange: "B3",
  logoUrl: null,
  market: "B3" as InvestmentTickerSuggestion["market"],
  name: "Itaúsa PN",
  price: "10.53",
  ticker: "ITSA4",
};

describe("ticker search (spec 104)", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("SHOULD offer the search results of a typed ticker after the 300 ms debounce", () => {
    searchQuery.reset().withData([itsa]);
    const { result } = setup();

    act(() => result.current.onTickerChange("it"));
    expect(result.current.suggestions).toEqual([]);

    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.suggestions).toEqual([itsa]);
    expect(result.current.quotedMarket).toBe("B3");
  });

  it("SHOULD block saving a quoted ticker that was not picked AND save the picked one", () => {
    searchQuery.reset().withData([itsa]);
    const { result } = setup();

    act(() => result.current.onTickerChange("itsa4"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => result.current.onNameChange("Itaúsa"));
    act(() => result.current.onSave());

    expect(createMutation.value.mutate).not.toHaveBeenCalled();
    expect(result.current.tickerError).toBe("investment.ticker.notFound");

    act(() => result.current.onTickerSelect("ITSA4"));
    act(() => result.current.onSave());

    expect(result.current.pickedQuote).toEqual(itsa);
    expect(createMutation.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ currency: "BRL", ticker: "ITSA4" }),
    );
  });

  it("SHOULD fill the name from the picked ticker until the name is typed", () => {
    searchQuery.reset().withData([itsa]);
    const { result } = setup();

    act(() => result.current.onTickerChange("itsa4"));
    act(() => {
      jest.advanceTimersByTime(300);
    });
    act(() => result.current.onTickerSelect("ITSA4"));

    expect(result.current.name).toBe("Itaúsa PN");
  });

  it("SHOULD ignore a pick that is not in the results", () => {
    const { result } = setup();

    act(() => result.current.onTickerSelect("NOPE"));

    expect(result.current.pickedQuote).toBeNull();
  });

  it("SHOULD report the source being unavailable", () => {
    searchQuery.reset().withError(new QuoteSourceUnavailable() as never);
    const { result } = setup();

    act(() => result.current.onTickerChange("itsa"));
    act(() => {
      jest.advanceTimersByTime(300);
    });

    expect(result.current.searchUnavailable).toBe(true);
  });

  it("SHOULD show the ticker error of a 422 TICKER_NOT_FOUND", () => {
    createMutation.reset().withError(new TickerNotFound() as never);
    const { result } = setup();

    expect(result.current.tickerError).toBe("investment.ticker.notFound");
    expect(result.current.failure).toBeUndefined();
  });
});

describe("fixed income (spec 105)", () => {
  it("SHOULD offer the calculated flow only for a NEW fixed income asset, on by default", () => {
    const { result } = setup();

    expect(result.current.showCalculated).toBe(false);
    expect(result.current.calculated).toBe(false);

    act(() => result.current.onAssetClassChange("FIXED_INCOME"));

    expect(result.current.showCalculated).toBe(true);
    expect(result.current.calculated).toBe(true);
  });

  it("SHOULD continue into the fixed income modal instead of creating the asset", () => {
    const { result } = setup();

    act(() => result.current.onAssetClassChange("FIXED_INCOME"));
    act(() => result.current.onSave());

    expect(modalNavigation.replaceModal).toHaveBeenCalledWith(
      "investment_fixed_income",
    );
    expect(createMutation.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD keep the manual flow WHEN the switch is off", () => {
    const { result } = setup();

    act(() => result.current.onAssetClassChange("FIXED_INCOME"));
    act(() => result.current.onCalculatedChange(false));
    act(() => result.current.onNameChange("CDB manual"));
    act(() => result.current.onCurrentValueChange("10000"));
    act(() => result.current.onSave());

    expect(modalNavigation.replaceModal).not.toHaveBeenCalled();
    expect(createMutation.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ assetClass: "FIXED_INCOME" }),
    );
  });
});
