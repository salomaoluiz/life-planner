import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentRedemptionTooLarge } from "@domain/entities/errors";
import { InvestmentFixedIncomeRedemptionKind } from "@domain/entities/investment/enums";
import {
  InvestmentAssetDetail,
  InvestmentFixedIncomeRedemptionPreview,
} from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeFixedIncomeDetail } from "@screens/Investment/mocks/fixtures";

import useFixedIncomeRedeemViewModel from "./useFixedIncomeRedeemViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@screens/Investment/FixedIncome/hooks/useDebouncedValue", () => ({
  __esModule: true,
  default: (value: unknown) => value,
}));
jest.mock("@screens/Investment/FixedIncome/hooks/useEligibleAccounts", () => ({
  __esModule: true,
  default: () => ({
    accounts: [{ id: "acc-1" }],
    isLoaded: true,
    options: [{ label: "Broker · BRL", value: "acc-1" }],
  }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentFixedIncomeRedemptionUseCase: {
      execute: jest.fn(),
      uniqueName: "redeem",
    },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    previewInvestmentFixedIncomeRedemptionUseCase: {
      execute: jest.fn(),
      uniqueName: "preview",
    },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const previewQuery =
  new UseQueryFixture<InvestmentFixedIncomeRedemptionPreview>();
const mutation = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 4, 12));
  detailQuery.reset().withData(makeFixedIncomeDetail());
  previewQuery.reset();
  mutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-fi" });
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      props.cacheKey.includes("fixed-income-preview")
        ? previewQuery.build()
        : detailQuery.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

afterEach(() => jest.useRealTimers());

function setup() {
  return renderHook(() => useFixedIncomeRedeemViewModel());
}

it("SHOULD start as a partial redemption with no amount, today and the first account", () => {
  const { result } = setup();

  expect(result.current.kind).toBe(InvestmentFixedIncomeRedemptionKind.PARTIAL);
  expect(result.current.netCents).toBe(0);
  expect(result.current.accountId).toBe("acc-1");
  expect(result.current.generate).toBe(true);
  expect(result.current.isLoading).toBe(false);
});

it("SHOULD pre-fill the estimated net of today for a total redemption AND let the owner replace it", () => {
  const { result } = setup();

  act(() =>
    result.current.onKindChange(InvestmentFixedIncomeRedemptionKind.TOTAL),
  );

  expect(result.current.netCents).toBe(1603607);

  act(() => result.current.onNetChange(1600000));

  expect(result.current.netCents).toBe(1600000);
});

it("SHOULD open on the maturity date with the net at maturity WHEN confirming a matured title", () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({
    assetId: "asset-fi",
    date: "2028-01-15",
    kind: "TOTAL",
  });

  const { result } = setup();

  expect(result.current.kind).toBe(InvestmentFixedIncomeRedemptionKind.TOTAL);
  expect(result.current.netCents).toBe(1846062);
  expect(result.current.date.getFullYear()).toBe(2028);
  expect(result.current.date.getMonth()).toBe(0);
  expect(result.current.date.getDate()).toBe(15);
});

it("SHOULD warn before the liquidity of an at-maturity title AND not on its maturity date", () => {
  const { result } = setup();

  expect(result.current.liquidityWarning).toBe("AT_MATURITY");

  act(() => result.current.onDateChange(new Date(2028, 0, 15, 12)));

  expect(result.current.liquidityWarning).toBeNull();
});

it("SHOULD not save without an amount, flag it AND then save the typed net", () => {
  const { result } = setup();

  act(() => result.current.onSave());

  expect(result.current.netError).toBe(true);
  expect(mutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onNetChange(600000));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    accountId: "acc-1",
    assetId: "asset-fi",
    date: "2026-11-04",
    generateTransaction: true,
    kind: "PARTIAL",
    netAmount: 600000,
  });
});

it("SHOULD leave the account out WHEN no finance entry is generated", () => {
  const { result } = setup();

  act(() => result.current.onNetChange(600000));
  act(() => result.current.onGenerateChange(false));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      accountId: undefined,
      generateTransaction: false,
    }),
  );
});

it("SHOULD change the account AND expose the preview of the app", () => {
  previewQuery.withData({
    gross: 613935,
    iof: 0,
    ir: 13935,
    liquidityWarning: null,
    lots: [],
    net: 600000,
    remaining: { gross: 1017131, principal: 955754 },
  });

  const { result } = setup();

  act(() => result.current.onNetChange(600000));
  act(() => result.current.onAccountChange("acc-2"));

  expect(result.current.accountId).toBe("acc-2");
  expect(result.current.preview?.gross).toBe(613935);
});

it("SHOULD block saving AND expose the available net WHEN a partial is larger than the title", () => {
  previewQuery.withError(
    new InvestmentRedemptionTooLarge({ availableNet: 1603607 }),
  );

  const { result } = setup();

  act(() => result.current.onNetChange(9000000));
  act(() => result.current.onSave());

  expect(result.current.availableNet).toBe(1603607);
  expect(result.current.preview).toBeUndefined();
  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD invalidate AND close after saving, show the failure otherwise", () => {
  mutation.withStatus("success");
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  mutation
    .reset()
    .withError(new InvestmentRedemptionTooLarge({ date: "2026-11-04" }));

  const { result } = setup();

  expect(result.current.failure?.key).toBe(
    "investment.fixedIncome.errors.redemptionTooLarge",
  );
});

it("SHOULD expose the loading AND not found states", () => {
  detailQuery.reset().withIsFetching(true);

  expect(setup().result.current.isLoading).toBe(true);

  detailQuery.reset().withError();

  expect(setup().result.current.isNotFound).toBe(true);
});
