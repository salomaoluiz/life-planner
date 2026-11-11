import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import AccountDTO from "@application/dto/financial/AccountDTO";
import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { InvestmentCurrencyMismatch } from "@domain/entities/errors";
import {
  InvestmentAssetClass,
  InvestmentIncomeStatus,
  InvestmentIncomeType,
} from "@domain/entities/investment/enums";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwnerScopedQuery from "@presentation/hooks/useOwnerScopedQuery";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import {
  makeDetail,
  makeIncome,
  makeSuggestion,
  owners,
} from "@screens/Investment/mocks/fixtures";

import useIncomeModalViewModel from "./useIncomeModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwnerScopedQuery");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    approveInvestmentIncomeSuggestionUseCase: {
      execute: jest.fn(),
      uniqueName: "approve",
    },
    createInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "create" },
    deleteInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "delete" },
    getFinancialAccountsUseCase: { execute: jest.fn(), uniqueName: "accounts" },
    getFinancialCategoriesUseCase: {
      execute: jest.fn(),
      uniqueName: "categories",
    },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "asset" },
    getInvestmentIncomeDefaultsUseCase: {
      execute: jest.fn(),
      uniqueName: "defaults",
    },
    getInvestmentIncomeSuggestionsUseCase: {
      execute: jest.fn(),
      uniqueName: "suggestions",
    },
    getInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "income" },
    updateInvestmentIncomeUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

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
function category(id: string, name: string, type: string, status = "ACTIVE") {
  return new CategoryDTO({
    icon: "cash",
    id,
    name,
    owner: "USER",
    ownerId: "user-1",
    status: status as never,
    type,
  });
}

const queries = {
  asset: new UseQueryFixture(),
  defaults: new UseQueryFixture(),
  income: new UseQueryFixture(),
  suggestions: new UseQueryFixture(),
};
const accountsQuery = new UseQueryFixture();
const categoriesQuery = new UseQueryFixture();
const saveMutation = new UseMutationFixture();
const deleteMutation = new UseMutationFixture();

function queryFor(cacheKey: string[]) {
  const key = cacheKey.join("/");

  if (key.includes("income-suggestions")) {
    return queries.suggestions;
  }
  if (key.includes("income-defaults")) {
    return queries.defaults;
  }
  if (key.includes("/income/")) {
    return queries.income;
  }

  return queries.asset;
}

beforeEach(() => {
  jest.clearAllMocks();
  queries.asset.reset().withData(makeDetail());
  queries.defaults.reset().withData({
    accountId: "acc-1",
    categoryId: "cat-1",
    currency: "BRL",
    quantity: "300",
    withholdingRate: "0",
  });
  queries.income.reset();
  queries.suggestions.reset();
  accountsQuery.reset().withData({
    accounts: [
      account("acc-1", "Main"),
      account("acc-usd", "Dollar", { currency: "USD" }),
      account("acc-old", "Old", { status: "ARCHIVED" }),
    ],
    owners,
  });
  categoriesQuery.reset().withData({
    categories: [
      category("cat-1", "Dividends", "INCOME"),
      category("cat-x", "Food", "EXPENSE"),
      category("cat-old", "Old", "INCOME", "ARCHIVED"),
    ],
  });
  saveMutation.reset();
  deleteMutation.reset();
  jest.mocked(useLocalSearchParams).mockReturnValue({ assetId: "asset-1" });
  jest
    .mocked(useQuery)
    .mockImplementation(((props: { cacheKey: string[]; enabled?: boolean }) =>
      queryFor(props.cacheKey).build()) as never);
  jest
    .mocked(useOwnerScopedQuery)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey.join("/").includes("categories")
        ? categoriesQuery
        : accountsQuery
      ).build()) as never);
  jest
    .mocked(useMutation)
    .mockImplementation(((props: { cacheKey: string[] }) =>
      (props.cacheKey[0] === "delete"
        ? deleteMutation
        : saveMutation
      ).build()) as never);
});

function setup() {
  return renderHook(() => useIncomeModalViewModel());
}

it("SHOULD open a new income with the defaults of the asset (account, category, position) AND hints", () => {
  const { result } = setup();

  expect(result.current.state).toMatchObject({
    accountId: "acc-1",
    categoryId: "cat-1",
    quantity: "300",
    status: InvestmentIncomeStatus.PLANNED,
    type: InvestmentIncomeType.DIVIDEND,
  });
  expect(result.current.accountHint).toBe(
    "investment.income.accountDefaultHint",
  );
  expect(result.current.categoryHint).toBe(
    "investment.income.categoryDefaultHint",
  );
  expect(result.current.titleKey).toBe("investment.income.title.create");
  expect(result.current.accountOptions).toEqual([
    { label: "Main", value: "acc-1" },
  ]);
  expect(result.current.categoryOptions).toEqual([
    { label: "Dividends", value: "cat-1" },
  ]);
});

it("SHOULD default a FII to Yield AND start with an empty quantity WHEN there is no position", () => {
  queries.asset.withData(
    makeDetail({ assetClass: InvestmentAssetClass.BR_REIT }),
  );
  queries.defaults.withData({
    accountId: null,
    categoryId: null,
    currency: "BRL",
    quantity: "0",
    withholdingRate: "0",
  });
  const { result } = setup();

  expect(result.current.state?.type).toBe(InvestmentIncomeType.YIELD);
  expect(result.current.state?.quantity).toBe("");
  expect(result.current.state?.accountId).toBe("");
  expect(result.current.accountHint).toBeUndefined();
});

it("SHOULD follow quantity × per unit for the net AND keep what the owner typed", () => {
  const { result } = setup();

  act(() => result.current.onQuantityChange("300"));
  act(() => result.current.onPerUnitChange("0,47"));

  expect(result.current.net).toBe(14100);

  act(() => result.current.onNetChange(14000));
  act(() => result.current.onPerUnitChange("0,50"));

  expect(result.current.net).toBe(14000);
});

it("SHOULD estimate the withholding of a JCP AND hide it for a dividend", () => {
  const { result } = setup();

  expect(result.current.estimate.show).toBe(false);

  act(() => result.current.onTypeChange(InvestmentIncomeType.JCP));
  act(() => result.current.onNetChange(7140));

  expect(result.current.estimate).toMatchObject({
    gross: "R$84.00",
    rate: "15%",
    show: true,
  });
});

it("SHOULD not save without account, category AND amount, then flag them", () => {
  queries.defaults.withData({
    accountId: null,
    categoryId: null,
    currency: "BRL",
    quantity: "0",
    withholdingRate: "0",
  });
  const { result } = setup();

  act(() => result.current.onSave());

  expect(result.current.errors).toMatchObject({
    accountId: "investment.form.operation.accountRequired",
    categoryId: "investment.income.errors.incomplete",
    netAmount: "investment.fixedIncome.redeem.invalid",
  });
  expect(saveMutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD create the income with the local day of the dates", () => {
  const { result } = setup();

  act(() => result.current.onNetChange(7140));
  act(() => result.current.onPaymentDateChange(new Date(2026, 9, 30)));
  act(() => result.current.onStatusChange(InvestmentIncomeStatus.RECEIVED));
  act(() => result.current.onSave());

  expect(saveMutation.value.mutate).toHaveBeenCalledWith({
    body: expect.objectContaining({
      accountId: "acc-1",
      assetId: "asset-1",
      categoryId: "cat-1",
      netAmount: 7140,
      paymentDate: "2026-10-30",
      status: "RECEIVED",
    }),
    kind: "create",
  });
});

it("SHOULD edit an income AND offer to delete it", () => {
  jest.mocked(useLocalSearchParams).mockReturnValue({ id: "income-1" });
  queries.income.withData(makeIncome());
  const { result } = setup();

  expect(result.current.isEditing).toBe(true);
  expect(result.current.titleKey).toBe("investment.income.title.edit");
  expect(result.current.state).toMatchObject({
    netAmount: 7140,
    quantity: "300",
  });

  act(() => result.current.onNotesChange("note"));
  expect(result.current.isDirty).toBe(true);
  act(() => result.current.onSave());

  expect(saveMutation.value.mutate).toHaveBeenCalledWith({
    body: expect.objectContaining({ id: "income-1", notes: "note" }),
    kind: "update",
  });

  act(() => result.current.onDeleteOpen());
  expect(result.current.isDeleteOpen).toBe(true);
  act(() => result.current.onDelete());
  expect(deleteMutation.value.mutate).toHaveBeenCalledWith("income-1");
  act(() => result.current.onDeleteClose());
  expect(result.current.isDeleteOpen).toBe(false);
});

it("SHOULD approve a suggestion with the values of the announcement AND the owner edits", () => {
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ assetId: "asset-1", suggestionId: "sug-1" });
  queries.suggestions.withData([makeSuggestion()]);
  const { result } = setup();

  expect(result.current.isApproving).toBe(true);
  expect(result.current.titleKey).toBe("investment.income.title.approve");
  expect(result.current.state).toMatchObject({
    perUnit: "0.47",
    quantity: "300",
    type: InvestmentIncomeType.DIVIDEND,
  });

  act(() => result.current.onNetChange(14000));
  act(() => result.current.onSave());

  expect(saveMutation.value.mutate).toHaveBeenCalledWith({
    body: expect.objectContaining({ id: "sug-1", netAmount: 14000 }),
    kind: "approve",
  });
  expect(
    (
      jest.mocked(saveMutation.value.mutate).mock.calls[0][0] as {
        body: object;
      }
    ).body,
  ).not.toHaveProperty("assetId");
});

it("SHOULD be loading until everything arrives AND not found WHEN the asset fails", () => {
  queries.asset.reset();
  expect(setup().result.current.isLoading).toBe(true);

  queries.asset.withError();
  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD invalidate AND close WHEN the save succeeds, showing the failure otherwise", () => {
  saveMutation.value.status = "success";
  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();

  saveMutation.reset().withError(new InvestmentCurrencyMismatch());
  expect(setup().result.current.failure).toEqual({
    key: "investment.income.errors.currencyMismatch",
  });
});

it("SHOULD change the account, the category, the dates, the status AND the per-unit value", () => {
  const { result } = setup();

  act(() => result.current.onAccountChange("acc-2"));
  act(() => result.current.onCategoryChange("cat-2"));
  act(() => result.current.onExDateChange(new Date(2026, 8, 10)));
  act(() => result.current.onPaymentDateChange(undefined));

  expect(result.current.state).toMatchObject({
    accountId: "acc-2",
    categoryId: "cat-2",
  });
  expect(result.current.state?.exDate).toEqual(new Date(2026, 8, 10));
});
