import { useIsFocused } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { InvestmentAssetStatus } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeEventOperation,
  makeFixedIncomeDetail,
  makeFractionSale,
  makeQuote,
  makeValuation,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useInvestmentDetailViewModel from "./useInvestmentDetailViewModel";

jest.mock("expo-router", () => ({
  router: { push: jest.fn(), replace: jest.fn(), setParams: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/useQuoteRefresh", () => ({
  __esModule: true,
  default: () => ({
    disabled: false,
    isRefreshing: false,
    onRefresh: jest.fn(),
    secondsLeft: 0,
    sourceDown: false,
  }),
}));
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "delete" },
    deleteInvestmentFixedIncomeRateUseCase: {
      execute: jest.fn(),
      uniqueName: "delRate",
    },
    deleteInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "delOp",
    },
    deleteInvestmentValuationUseCase: {
      execute: jest.fn(),
      uniqueName: "delVal",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "asset" },
    getInvestmentPriceHistoryUseCase: {
      execute: jest.fn(),
      uniqueName: "history",
    },
    updateInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

interface Data {
  asset: InvestmentAssetDetail;
  owners: OwnerDTO[];
}

const detailQuery = new UseQueryFixture<Data>();
const accountsQuery = new UseQueryFixture<AccountDTO[]>();
const historyQuery = new UseQueryFixture<unknown>();
const archiveMutation = new UseMutationFixture();
const deleteMutation = new UseMutationFixture();
const valuationMutation = new UseMutationFixture();
const rateMutation = new UseMutationFixture();
const operationMutation = new UseMutationFixture();

const spies = {
  isFocused: jest.mocked(useIsFocused),
  params: jest.mocked(useLocalSearchParams),
  replace: jest.mocked(router.replace),
  setParams: jest.mocked(router.setParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useOwnerScopedQuery),
};

function queryFor(props: { cacheKey: string[] }) {
  if (props.cacheKey.includes("price-history")) {
    return historyQuery.build();
  }

  return props.cacheKey.includes("asset") && props.cacheKey[0] === "investment"
    ? detailQuery.build()
    : accountsQuery.build();
}

beforeEach(() => {
  jest.clearAllMocks();
  detailQuery.reset();
  accountsQuery.reset();
  historyQuery.reset();
  archiveMutation.reset();
  deleteMutation.reset();
  valuationMutation.reset();
  rateMutation.reset();
  operationMutation.reset();
  spies.isFocused.mockReturnValue(false);
  spies.params.mockReturnValue({ id: "asset-1" });
  spies.useQuery.mockImplementation(queryFor as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    ({
      delete: deleteMutation,
      delOp: operationMutation,
      delRate: rateMutation,
      delVal: valuationMutation,
      update: archiveMutation,
    })[props.cacheKey[0]]?.build()) as never);
});

function givenDetail(asset = makeDetail(), data = owners) {
  detailQuery.reset().withData({ asset, owners: data });
}

function setup() {
  return renderHook(() => useInvestmentDetailViewModel());
}

it("SHOULD expose the asset, the account names AND the sell count", () => {
  givenDetail();
  accountsQuery.reset().withData([
    new AccountDTO({
      balance: 0,
      icon: "bank",
      id: "acc-1",
      name: "Broker",
      owner: "USER",
      ownerId: "user-1",
      status: "ACTIVE",
    }),
  ]);

  const { result } = setup();

  expect(result.current.asset?.id).toBe("asset-1");
  expect(result.current.accountNames.get("acc-1")).toBe("Broker");
  expect(result.current.sellCount).toBe(1);
  expect(result.current.deleteSummary).toEqual({ entries: 2, operations: 2 });
  expect(result.current.ownerLabel).toBe("");
});

it("SHOULD label a family asset with the family name", () => {
  givenDetail(makeDetail({ owner: OwnerType.FAMILY, ownerId: "fam-1" }));

  expect(setup().result.current.ownerLabel).toBe("Test Family");
});

it("SHOULD expose the loading, not found AND refreshing states", () => {
  detailQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  detailQuery.reset().withError();
  expect(setup().result.current.isNotFound).toBe(true);

  givenDetail();
  detailQuery.withIsFetching(true);
  expect(setup().result.current.isRefreshing).toBe(true);
});

it("SHOULD open the modals with the asset id", () => {
  givenDetail();
  const { result } = setup();

  result.current.onAddOperation();
  result.current.onUpdateValue();
  result.current.onEdit();
  result.current.onOperationPress("op-1");

  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "investment_operation",
    { assetId: "asset-1" },
  );
  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "investment_valuation",
    { assetId: "asset-1" },
  );
  expect(modalNavigation.openModal).toHaveBeenCalledWith("investment_asset", {
    id: "asset-1",
  });
  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "investment_operation",
    { assetId: "asset-1", id: "op-1" },
  );
});

it("SHOULD open the operation named by the route param once", () => {
  spies.params.mockReturnValue({ id: "asset-1", operation: "op-1" });
  givenDetail();

  setup();

  expect(modalNavigation.openModal).toHaveBeenCalledWith(
    "investment_operation",
    { assetId: "asset-1", id: "op-1" },
  );
  expect(spies.setParams).toHaveBeenCalledWith({ operation: undefined });
});

it("SHOULD ignore an operation param that is not in the asset", () => {
  spies.params.mockReturnValue({ id: "asset-1", operation: "ghost" });
  givenDetail();

  setup();

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

it("SHOULD archive and reactivate through the update use case", () => {
  givenDetail();
  const { result } = setup();

  result.current.onArchiveToggle();
  expect(archiveMutation.value.mutate).toHaveBeenCalledWith({
    id: "asset-1",
    status: InvestmentAssetStatus.ARCHIVED,
  });

  givenDetail(
    makeDetail({
      archivedAt: "2026-10-20T00:00:00Z",
      status: InvestmentAssetStatus.ARCHIVED,
    }),
  );
  const archived = setup();
  archived.result.current.onArchiveToggle();
  expect(archived.result.current.archived).toBe(true);
  expect(archiveMutation.value.mutate).toHaveBeenLastCalledWith({
    id: "asset-1",
    status: InvestmentAssetStatus.ACTIVE,
  });
});

it("SHOULD confirm the delete AND go back to the list after it", () => {
  givenDetail();
  const { rerender, result } = setup();

  act(() => result.current.onDeleteOpen());
  expect(result.current.isDeleteOpen).toBe(true);
  act(() => result.current.onDeleteCancel());
  expect(result.current.isDeleteOpen).toBe(false);

  result.current.onDeleteConfirm();
  expect(deleteMutation.value.mutate).toHaveBeenCalledWith("asset-1");

  deleteMutation.withStatus("success");
  rerender({});
  expect(invalidateInvestments).toHaveBeenCalled();
  expect(spies.replace).toHaveBeenCalledWith("/investments");
});

it("SHOULD delete a valuation AND invalidate after it", () => {
  givenDetail();
  const { rerender, result } = setup();

  result.current.onDeleteValuation("val-1");
  expect(valuationMutation.value.mutate).toHaveBeenCalledWith("val-1");

  valuationMutation.withStatus("success");
  rerender({});
  expect(invalidateInvestments).toHaveBeenCalled();
  expect(valuationMutation.value.reset).toHaveBeenCalled();
});

it("SHOULD invalidate AND reset after an archive", () => {
  givenDetail();
  archiveMutation.withStatus("success");

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(archiveMutation.value.reset).toHaveBeenCalled();
});

it("SHOULD map a mutation failure to a message", () => {
  givenDetail();
  archiveMutation.withError();

  expect(setup().result.current.errorMessage?.key).toBe(
    "common.errors.generic",
  );
});

it("SHOULD refetch WHEN focused AND on refresh, back and menu", async () => {
  givenDetail();
  spies.isFocused.mockReturnValue(true);
  const { result } = setup();

  expect(detailQuery.value.refetch).toHaveBeenCalled();
  await result.current.onRefresh();
  await result.current.onRetry();
  result.current.onBack();
  act(() => result.current.onMenuOpen());
  expect(result.current.isMenuOpen).toBe(true);
  act(() => result.current.onMenuClose());
  expect(spies.replace).toHaveBeenCalledWith("/investments");
});

it("SHOULD block the actions of a read-only asset with the toast", () => {
  const archivedOwners = [
    ...owners,
    new OwnerDTO({
      archived: true,
      id: "old",
      name: "Old",
      type: OwnerType.FAMILY,
    }),
  ];
  givenDetail(
    makeDetail({ owner: OwnerType.FAMILY, ownerId: "old" }),
    archivedOwners,
  );
  const { result } = setup();

  act(() => result.current.onAddOperation());

  expect(result.current.readOnly).toBe(true);
  expect(modalNavigation.openModal).not.toHaveBeenCalled();
  expect(result.current.toastVisible).toBe(true);
  act(() => result.current.onToastHide());
});

describe("quotes (spec 104)", () => {
  it("SHOULD read the history of the range AND change range and mode", () => {
    givenDetail();
    const { result } = setup();

    expect(result.current.range).toBe("1Y");
    expect(result.current.chartMode).toBe("price");
    expect(
      spies.useQuery.mock.calls.some(([props]) =>
        (props as { cacheKey: string[] }).cacheKey.includes("price-history"),
      ),
    ).toBe(true);

    act(() => result.current.onRangeChange("6M" as never));
    act(() => result.current.onChartModeChange("position"));

    expect(result.current.range).toBe("6M");
    expect(result.current.chartMode).toBe("position");
  });

  it("SHOULD expose the refresh state of the quotes", () => {
    givenDetail();
    const { result } = setup();

    expect(result.current.quotesDisabled).toBe(false);
    expect(result.current.quotesSecondsLeft).toBe(0);
    expect(result.current.quotesSourceDown).toBe(false);
    expect(result.current.quotesRefreshing).toBe(false);
    expect(typeof result.current.onQuotesRefresh).toBe("function");
  });

  it("SHOULD delete the newest manual value to go back to the automatic quote, only over a quote", () => {
    givenDetail(
      makeDetail({
        priceSource: "MANUAL" as never,
        quote: makeQuote(),
        valuations: [makeValuation({ id: "val-9" })],
      }),
    );
    const { result } = setup();

    expect(result.current.manualOverQuote).toBe(true);

    act(() => result.current.onBackToAutomatic());

    expect(valuationMutation.value.mutate).toHaveBeenCalledWith("val-9");
  });

  it("SHOULD not offer to go back WHEN the price already is the quote or there is no value", () => {
    givenDetail(
      makeDetail({
        priceSource: "QUOTE" as never,
        quote: makeQuote(),
        valuations: [],
      }),
    );
    const { result } = setup();

    expect(result.current.manualOverQuote).toBe(false);

    act(() => result.current.onBackToAutomatic());

    expect(valuationMutation.value.mutate).not.toHaveBeenCalled();
  });
});

describe("fixed income (spec 105)", () => {
  it("SHOULD expose the fixed income, open the actions with the asset id AND confirm the maturity", () => {
    givenDetail(makeFixedIncomeDetail());

    const { result } = setup();

    expect(result.current.fixedIncome?.product).toBe("CDB");
    expect(result.current.fixedIncomeTab).toBe("lots");

    act(() => result.current.onRedeem());
    act(() => result.current.onContribute());
    act(() => result.current.onUpdateRate());
    act(() => result.current.onAdjust());
    act(() => result.current.onRateEdit("rate-1"));
    act(() => result.current.onConfirmMaturity());

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_redeem",
      { assetId: "asset-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_contribution",
      { assetId: "asset-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_rate",
      { assetId: "asset-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_adjust",
      { assetId: "asset-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_rate",
      { assetId: "asset-1", rateId: "rate-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fixed_income_redeem",
      { assetId: "asset-1", date: "2028-01-15", kind: "TOTAL" },
    );
  });

  it("SHOULD switch the tab AND the more-actions menu", () => {
    givenDetail(makeFixedIncomeDetail());

    const { result } = setup();

    act(() => result.current.onFixedIncomeTabChange("rates"));
    act(() => result.current.onFixedIncomeMore());

    expect(result.current.fixedIncomeTab).toBe("rates");
    expect(result.current.fixedIncomeMenuOpen).toBe(true);

    act(() => result.current.onFixedIncomeMenuClose());

    expect(result.current.fixedIncomeMenuOpen).toBe(false);
  });

  it("SHOULD delete a rate AND an operation, then invalidate", () => {
    givenDetail(makeFixedIncomeDetail());

    const { result } = setup();

    act(() => result.current.onRateDelete("rate-2"));
    act(() => result.current.onFixedIncomeOperationDelete("lot-1"));

    expect(rateMutation.value.mutate).toHaveBeenCalledWith("rate-2");
    expect(operationMutation.value.mutate).toHaveBeenCalledWith("lot-1");

    rateMutation.withStatus("success");
    operationMutation.withStatus("success");
    setup();

    expect(invalidateInvestments).toHaveBeenCalled();
  });
});

describe("corporate events (spec 108)", () => {
  function givenEvents() {
    givenDetail(
      makeDetail({
        operations: [makeFractionSale(), makeEventOperation()],
      }),
    );
  }

  it("SHOULD open the fraction sale modal for the row of a fraction sale AND the operation form for any other", () => {
    givenEvents();
    const { result } = setup();

    result.current.onOperationPress("sale-1");
    result.current.onOperationPress("event-1");

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fraction_sale",
      { assetId: "asset-1", eventId: "event-1", id: "sale-1" },
    );
    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_operation",
      { assetId: "asset-1", id: "event-1" },
    );
  });

  it("SHOULD open the fraction sale modal for an event", () => {
    givenEvents();
    const { result } = setup();

    result.current.onSellFraction("event-1");

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fraction_sale",
      { assetId: "asset-1", eventId: "event-1" },
    );
  });

  it("SHOULD not count a fraction sale as a sell", () => {
    givenEvents();

    expect(setup().result.current.sellCount).toBe(0);
  });

  it("SHOULD open the fraction sale named by the route param", () => {
    spies.params.mockReturnValue({ id: "asset-1", operation: "sale-1" });
    givenEvents();

    setup();

    expect(modalNavigation.openModal).toHaveBeenCalledWith(
      "investment_fraction_sale",
      { assetId: "asset-1", eventId: "event-1", id: "sale-1" },
    );
  });
});
