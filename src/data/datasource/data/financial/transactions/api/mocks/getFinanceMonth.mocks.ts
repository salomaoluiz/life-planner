import { api } from "@infrastructure/api";

import fetchTransactionPages from "../fetchTransactionPages";
import getFinanceMonth from "../getFinanceMonth";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));
jest.mock("../fetchTransactionPages", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const ownerId = "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d";
const apiTransaction = {
  categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  currency: "BRL",
  date: "2026-11-03",
  description: "Weekly groceries",
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  owner: "USER",
  ownerId,
  paid: true,
  type: "EXPENSE",
  value: 23490,
};
const apiResponse = {
  dailyBalances: { accounts: [], days: [], month: "2026-11" },
  invoices: [],
  lookups: {
    accounts: {},
    categories: {
      "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607": { name: "Groceries" },
    },
    creditCards: {},
    tags: {},
  },
  month: "2026-11",
  projections: [],
  rows: { items: [apiTransaction], nextCursor: null as null | string },
  summary: {
    currency: "BRL",
    expense: 23490,
    income: 0,
    projectedExpense: 0,
    projectedIncome: 0,
    toPay: 0,
    toReceive: 0,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(ownerIds: string[] = [ownerId]) {
  return getFinanceMonth({ month: "2026-11", ownerIds });
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  fetchTransactionPages: jest.mocked(fetchTransactionPages),
  get: jest.mocked(api.get),
};
const mocks = { apiResponse, apiTransaction, ownerId };

export { mocks, setup, setupThrowable, spies };
