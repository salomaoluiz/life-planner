import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import {
  InvestmentAsset,
  InvestmentAssetDetail,
  InvestmentConversion,
} from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeAsset,
  makeConversion,
  makeDetail,
  makePosition,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useConversionModalViewModel from "./useConversionModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentConversionUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    getFinancialAccountsUseCase: { execute: jest.fn() },
    getInvestmentAssetsUseCase: { execute: jest.fn() },
    getInvestmentAssetUseCase: { execute: jest.fn() },
    getInvestmentConversionUseCase: { execute: jest.fn() },
    getInvestmentPriceHistoryUseCase: { execute: jest.fn() },
    searchInvestmentTickersUseCase: { execute: jest.fn() },
    updateInvestmentConversionUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

const origin = makeDetail({
  assetClass: InvestmentAssetClass.BR_REIT,
  id: "origin",
  operations: [],
  position: makePosition({ cost: 808550, quantity: "103" }),
  ticker: "BCFF11",
});
const destination = makeAsset({
  assetClass: InvestmentAssetClass.BR_REIT,
  id: "dest",
  position: makePosition({ cost: 51000, quantity: "50" }),
  ticker: "BTHF11",
});
const account = {
  currency: "BRL",
  id: "acc-1",
  name: "Broker",
  ownerId: "user-1",
  status: "ACTIVE",
} as AccountDTO;

const originQuery = new UseQueryFixture<InvestmentAssetDetail>();
const conversionQuery = new UseQueryFixture<InvestmentConversion>();
const assetsQuery = new UseQueryFixture<InvestmentAsset[]>();
const destinationQuery = new UseQueryFixture<InvestmentAssetDetail>();
const accountsQuery = new UseQueryFixture<{
  accounts: AccountDTO[];
  owners: typeof owners;
}>();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();
const anyQuery = new UseQueryFixture();

const spies = {
  accounts: jest.mocked(useOwnerScopedQuery),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  originQuery.reset().withData(origin);
  conversionQuery.reset();
  assetsQuery.reset().withData([destination]);
  destinationQuery.reset();
  anyQuery.reset();
  accountsQuery.reset().withData({ accounts: [account], owners });
  createMutation.reset();
  updateMutation.reset();
  spies.params.mockReturnValue({ assetId: "origin" });
  spies.accounts.mockReturnValue(accountsQuery.build() as never);
  spies.useQuery.mockImplementation(((props: { cacheKey: string[] }) => {
    const key = props.cacheKey.join("/");

    if (key === "investment/asset/origin/conversion-form") {
      return originQuery.build();
    }
    if (key.startsWith("investment/conversion/")) {
      return conversionQuery.build();
    }
    if (key.startsWith("investment/assets/")) {
      return assetsQuery.build();
    }
    if (key === "investment/asset/asset-to/conversion-form") {
      return destinationQuery.build();
    }

    return anyQuery.build();
  }) as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    (props.cacheKey[0] === "create"
      ? createMutation
      : updateMutation
    ).build()) as never);
});

function setup() {
  return renderHook(() => useConversionModalViewModel());
}

it("SHOULD start from the defaults WITH the eligible destination AND the preview of the spec example", () => {
  const { result } = setup();

  expect(result.current.isEdit).toBe(false);
  expect(result.current.destinationOptions).toHaveLength(1);
  expect(result.current.destinationId).toBe("dest");
  expect(result.current.ratioFrom).toBe("1");
  act(() => result.current.onRatioToChange("7,4"));

  expect(result.current.preview).toMatchObject({
    hasFraction: true,
    quantityAfter: "812",
  });
});

it("SHOULD refuse to submit while the form is invalid AND create the conversion once valid", () => {
  const { result } = setup();

  act(() => result.current.onRatioFromChange("0"));
  act(() => result.current.onSubmit());
  expect(result.current.errors.ratioFrom).toBe(true);
  expect(createMutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onRatioFromChange("1"));
  act(() => result.current.onRatioToChange("7,4"));
  act(() => result.current.onSubmit());

  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      assetId: "origin",
      destination: { assetId: "dest" },
      generateTransaction: false,
      ratioFrom: "1",
      ratioTo: "7,4",
    }),
  );
});

it("SHOULD create a new destination with the typed ticker AND name", () => {
  const { result } = setup();

  act(() => result.current.onModeChange("new"));
  act(() => result.current.onTickerChange("xpto11"));
  act(() => result.current.onNameChange("Fundo Exemplo"));
  act(() => result.current.onSubmit());

  expect(result.current.destinationTicker).toBe("XPTO11");
  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      destination: { newAsset: { name: "Fundo Exemplo", ticker: "XPTO11" } },
    }),
  );
});

it("SHOULD send the cash part with the account AND the reference value", () => {
  const { result } = setup();

  act(() => result.current.onCashChange(1500));
  act(() => result.current.onReferenceChange("10,4"));
  act(() => result.current.onSubmit());

  expect(result.current.hasCash).toBe(true);
  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      accountId: "acc-1",
      cashAmount: 1500,
      cashReferenceUnitValue: "10,4",
      generateTransaction: true,
    }),
  );
  expect(result.current.preview?.realizedOut).toBeDefined();
});

it("SHOULD close AND invalidate the investments WHEN the conversion is saved", () => {
  createMutation.withStatus("success");
  setup();

  expect(invalidateInvestments).toHaveBeenCalledTimes(1);
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
});

it("SHOULD edit an existing conversion keeping its destination", () => {
  spies.params.mockReturnValue({ assetId: "origin", id: "conv-1" });
  conversionQuery
    .reset()
    .withData(
      makeConversion({ cashAmount: 1500, cashReferenceUnitValue: "10.4" }),
    );
  destinationQuery.reset().withData(
    makeDetail({
      assetClass: InvestmentAssetClass.BR_REIT,
      id: "asset-to",
      position: makePosition({ cost: 859338, quantity: "812" }),
      ticker: "BTHF11",
    }),
  );

  const { result } = setup();

  expect(result.current.isEdit).toBe(true);
  expect(result.current.destinationTicker).toBe("BTHF11");
  expect(result.current.cashAmount).toBe(1500);
  expect(result.current.preview?.quantityBefore).toBe("50");

  act(() => result.current.onRatioToChange("8"));
  act(() => result.current.onSubmit());

  expect(updateMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ cashAmount: 1500, id: "conv-1", ratioTo: "8" }),
  );
});

it("SHOULD remove the cash part on edit WHEN the amount is cleared", () => {
  spies.params.mockReturnValue({ assetId: "origin", id: "conv-1" });
  conversionQuery
    .reset()
    .withData(
      makeConversion({ cashAmount: 1500, cashReferenceUnitValue: "10.4" }),
    );

  const { result } = setup();

  act(() => result.current.onCashChange(undefined));
  act(() => result.current.onSubmit());

  expect(updateMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ cashAmount: null, generateTransaction: false }),
  );
});

it("SHOULD be loading WHILE the origin loads AND not found WHEN it fails", () => {
  originQuery.reset().withIsFetching(true);
  expect(setup().result.current.isLoading).toBe(true);

  originQuery.reset().withError();
  expect(setup().result.current.isNotFound).toBe(true);
});
