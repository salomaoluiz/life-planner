import { api } from "@infrastructure/api";

import getAccounts from "../getAccounts";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

// region mocks
const ownerIds = [
  "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  "9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d",
];
const apiAccounts = [
  {
    balance: 152075,
    createdAt: "2026-10-04T12:00:00.000Z",
    icon: "bank",
    id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
    name: "Checking",
    owner: "USER",
    ownerId: ownerIds[0],
    status: "ACTIVE",
    updatedAt: "2026-10-04T12:00:00.000Z",
  },
];
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(ids: string[] = ownerIds) {
  return getAccounts(ids);
}

async function setupThrowable(ids: string[] = ownerIds) {
  try {
    await setup(ids);
  } catch (error) {
    return error;
  }
}

const spies = { get: jest.mocked(api.get) };
const mocks = { apiAccounts, ownerIds };

export { mocks, setup, setupThrowable, spies };
