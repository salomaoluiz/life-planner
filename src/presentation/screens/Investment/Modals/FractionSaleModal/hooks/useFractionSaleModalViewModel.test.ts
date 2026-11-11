import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import { InvestmentFractionAlreadySold } from "@domain/entities/errors";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeEventOperation,
  makeFractionSale,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useFractionSaleModalViewModel from "./useFractionSaleModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentFractionSaleUseCase: {
      execute: jest.fn(),
      uniqueName: "create",
    },
    deleteInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "delete",
    },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "asset" },
    updateInvestmentOperationUseCase: {
      execute: jest.fn(),
      uniqueName: "update",
    },
  },
}));

const assetQuery = new UseQueryFixture();
const accountsQuery = new UseQueryFixture();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();
const deleteMutation = new UseMutationFixture();

function account(id: string, name: string, overrides = {}) {
  return new AccountDTO({
    balance: 0,
    icon: "bank",
    id,
    name,
    owner: "USER",
    ownerId: "user-1",
    status: "ACTIVE",
    ...overrides,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers().setSystemTime(new Date(2026, 10, 11, 12));
  assetQuery
    .reset()
    .withData(
      makeDetail({ operations: [makeEventOperation(), makeFractionSale()] }),
    );
  accountsQuery.reset().withData({
    accounts: [
      account("acc-1", "Main"),
      account("acc-usd", "Dollar", { currency: "USD" }),
    ],
    owners,
  });
  createMutation.reset();
  updateMutation.reset();
  deleteMutation.reset();
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-1", eventId: "event-1" });
  jest.mocked(useQuery).mockImplementation((() => assetQuery.build()) as never);
  jest
    .mocked(useOwnerScopedQuery)
    .mockImplementation((() => accountsQuery.build()) as never);
  jest.mocked(useMutation).mockImplementation(((props: {
    cacheKey: string[];
  }) =>
    ({
      create: createMutation,
      delete: deleteMutation,
      update: updateMutation,
    })[props.cacheKey[0] as "create" | "delete" | "update"].build()) as never);
});
afterEach(() => jest.useRealTimers());

function setup() {
  return renderHook(() => useFractionSaleModalViewModel());
}

it("SHOULD open with the fraction of the event AND the account in the asset currency", () => {
  const { result } = setup();

  expect(result.current).toMatchObject({
    accountId: "acc-1",
    assetLabel: "ITSA4",
    eventTypeKey: "investment.operation.REVERSE_SPLIT",
    gross: 0,
    isEdit: false,
    writeOff: false,
  });
  expect(result.current.fractionQuantity).toBe("0.5");
  expect(result.current.accountOptions).toEqual([
    { label: "Main", value: "acc-1" },
  ]);
});

it("SHOULD record the sale with the typed amount, date, account AND fees", () => {
  const { result } = setup();

  act(() => result.current.onGrossChange(520));
  act(() => result.current.onDateChange(new Date(2026, 3, 4)));
  act(() => result.current.onAddFee());

  const [fee] = result.current.fees;

  act(() => result.current.onFeeAmountChange(fee.key, 20));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith({
    accountId: "acc-1",
    date: "2026-04-04",
    eventId: "event-1",
    fees: [{ amount: 20, description: undefined, kind: "BROKERAGE" }],
    generateTransaction: true,
    grossAmount: 520,
  });
  expect(result.current.realized).toContain("0.");
});

it("SHOULD not save without an amount, nor a date before the event", () => {
  const { result } = setup();

  act(() => result.current.onSave());
  act(() => result.current.onGrossChange(520));
  act(() => result.current.onDateChange(new Date(2026, 2, 9)));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).not.toHaveBeenCalled();
  expect(result.current.errors.date).toBe("before");
});

it("SHOULD write the fraction off without an account WHEN the switch is on", () => {
  const { result } = setup();

  act(() => result.current.onWriteOffChange(true));
  act(() => result.current.onDateChange(new Date(2026, 3, 4)));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith({
    accountId: undefined,
    date: "2026-04-04",
    eventId: "event-1",
    fees: [],
    generateTransaction: false,
    grossAmount: 0,
  });
});

it("SHOULD edit the sale of the fraction through the operation update", () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-1", eventId: "event-1", id: "sale-1" });
  const { result } = setup();

  expect(result.current).toMatchObject({ gross: 520, isEdit: true });

  act(() => result.current.onGrossChange(600));
  act(() => result.current.onSave());

  expect(updateMutation.value.mutate).toHaveBeenCalledWith({
    accountId: "acc-1",
    date: "2026-04-04",
    fees: [],
    generateTransaction: true,
    grossAmount: 600,
    id: "sale-1",
  });
});

it("SHOULD delete the sale WHEN editing AND close once a write succeeds", () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-1", eventId: "event-1", id: "sale-1" });
  const { result } = setup();

  act(() => result.current.onDelete());
  expect(deleteMutation.value.mutate).toHaveBeenCalledWith("sale-1");

  createMutation.value.status = "success";
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD expose the failure of a second sale AND the not found states", () => {
  createMutation.reset().withError(new InvestmentFractionAlreadySold());
  const { result } = setup();

  expect(result.current.failure).toEqual({
    key: "investment.errors.fractionAlreadySold",
  });

  assetQuery.reset().withData(makeDetail());
  expect(setup().result.current.isNotFound).toBe(true);
});
