import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import { InvestmentArchived } from "@domain/entities/errors";
import {
  InvestmentFixedIncomeLiquidity,
  InvestmentFixedIncomeProduct,
  InvestmentFixedIncomeRateMode,
} from "@domain/entities/investment/enums";
import { InvestmentFixedIncomeSimulation } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { owners } from "@screens/Investment/mocks/fixtures";

import useFixedIncomeTitleViewModel from "./useFixedIncomeTitleViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@presentation/hooks/useOwners");
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
    createInvestmentFixedIncomeTitleUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    simulateInvestmentFixedIncomeUseCase: {
      execute: jest.fn(),
      uniqueName: "simulate",
    },
  },
}));

const simulation = new UseQueryFixture<InvestmentFixedIncomeSimulation>();
const mutation = new UseMutationFixture();

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 0, 15, 12));
  simulation.reset();
  mutation.reset();
  jest.mocked(useActiveOwners).mockReturnValue({ data: owners } as never);
  jest.mocked(useOwners).mockReturnValue({ data: owners } as never);
  jest.mocked(useQuery).mockImplementation((() => simulation.build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

afterEach(() => jest.useRealTimers());

function fillValid(result: ReturnType<typeof setup>["result"]) {
  act(() => result.current.onNameChange("CDB Banco Exemplo 2028"));
  act(() => result.current.onAmountChange(1000000));
  act(() =>
    result.current.onRateChange({
      ...result.current.rate,
      cdiPercent: "110",
      indexRate: "14,90",
    }),
  );
}

function setup() {
  return renderHook(() => useFixedIncomeTitleViewModel());
}

it("SHOULD start as a CDB, taxable, at-maturity, one year ahead with the personal owner", () => {
  const { result } = setup();

  expect(result.current.product).toBe(InvestmentFixedIncomeProduct.CDB);
  expect(result.current.taxExempt).toBe(false);
  expect(result.current.liquidity).toBe(
    InvestmentFixedIncomeLiquidity.AT_MATURITY,
  );
  expect(result.current.maturity.getFullYear()).toBe(2027);
  expect(result.current.ownerId).toBe("user-1");
  expect(result.current.accountId).toBe("acc-1");
  expect(result.current.rate.mode).toBe(
    InvestmentFixedIncomeRateMode.CDI_PERCENT,
  );
});

it("SHOULD pre-fill the tax exemption again only WHEN the product changes AND keep a manual change", () => {
  const { result } = setup();

  act(() => result.current.onProductChange(InvestmentFixedIncomeProduct.LCI));

  expect(result.current.taxExempt).toBe(true);

  act(() => result.current.onTaxExemptChange(false));

  expect(result.current.taxExempt).toBe(false);

  act(() => result.current.onProductChange(InvestmentFixedIncomeProduct.LCA));

  expect(result.current.taxExempt).toBe(true);
});

it("SHOULD not save an empty form AND expose every error after the first attempt", () => {
  const { result } = setup();

  expect(result.current.errors).toBeUndefined();

  act(() => result.current.onSave());

  expect(result.current.errors).toMatchObject({
    amount: true,
    name: true,
    rate: true,
  });
  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD refuse a maturity that is not after the date AND a grace date outside the term", () => {
  const { result } = setup();

  fillValid(result);
  act(() => result.current.onMaturityChange(new Date(2026, 0, 15, 12)));
  act(() => result.current.onSave());

  expect(result.current.errors?.maturity).toBe(true);

  act(() => result.current.onMaturityChange(new Date(2028, 0, 15, 12)));
  act(() =>
    result.current.onLiquidityChange(
      InvestmentFixedIncomeLiquidity.GRACE_PERIOD,
    ),
  );
  act(() => result.current.onLiquidityDateChange(new Date(2029, 0, 15, 12)));
  act(() => result.current.onSave());

  expect(result.current.errors?.grace).toBe(true);
  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD create the title with the terms, the first rate AND the first contribution", () => {
  const { result } = setup();

  fillValid(result);
  act(() => result.current.onMaturityChange(new Date(2028, 0, 15, 12)));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    contribution: {
      accountId: "acc-1",
      amount: 1000000,
      date: "2026-01-15",
      generateTransaction: true,
    },
    name: "CDB Banco Exemplo 2028",
    owner: "USER",
    ownerId: "user-1",
    rate: expect.objectContaining({
      cdiPercent: "110",
      indexRate: "14,90",
      mode: "CDI_PERCENT",
      startDate: undefined,
    }),
    terms: {
      liquidity: "AT_MATURITY",
      liquidityDate: null,
      maturityDate: "2028-01-15",
      product: "CDB",
      taxExempt: false,
    },
  });
});

it("SHOULD send the grace date only for a grace period AND leave the account out without a finance entry", () => {
  const { result } = setup();

  fillValid(result);
  act(() => result.current.onOwnerChange("fam-1"));
  act(() => result.current.onGenerateChange(false));
  act(() =>
    result.current.onLiquidityChange(
      InvestmentFixedIncomeLiquidity.GRACE_PERIOD,
    ),
  );
  act(() => result.current.onLiquidityDateChange(new Date(2026, 11, 10, 12)));
  act(() => result.current.onSave());

  expect(mutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      contribution: expect.objectContaining({
        accountId: undefined,
        generateTransaction: false,
      }),
      owner: "FAMILY",
      ownerId: "fam-1",
      terms: expect.objectContaining({
        liquidity: "GRACE_PERIOD",
        liquidityDate: "2026-12-10",
      }),
    }),
  );
});

it("SHOULD expose the estimate of the simulation only WHEN the form can be simulated", () => {
  simulation.withData({
    atMaturity: { gross: 1357480, iof: 0, ir: 53622, net: 1303858 },
    effectiveRate: "16.510000",
  });

  const { result } = setup();

  expect(result.current.estimate).toBeUndefined();

  fillValid(result);
  act(() => result.current.onAccountChange("acc-1"));

  expect(result.current.estimate?.atMaturity.net).toBe(1303858);
  expect(result.current.estimateLoading).toBe(false);
});

it("SHOULD invalidate AND close after saving, show the failure otherwise", () => {
  mutation.withStatus("success");
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  mutation.reset().withError(new InvestmentArchived());

  expect(setup().result.current.failure?.key).toBe(
    "investment.errors.archived",
  );
});
