import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import createAccount from "../createAccount";

jest.mock("@infrastructure/api", () => ({
  api: { post: jest.fn() },
}));

// region mocks
const params = {
  balance: 1520.75,
  icon: "bank",
  name: "Checking",
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  status: AccountStatus.ACTIVE,
};
const apiAccount = {
  balance: 152075,
  createdAt: "2026-10-04T12:00:00.000Z",
  icon: "bank",
  id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  name: "Checking",
  owner: "USER",
  ownerId: params.ownerId,
  status: "ACTIVE",
  updatedAt: "2026-10-04T12:00:00.000Z",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(override: Partial<typeof params> = {}) {
  return createAccount({ ...params, ...override });
}

async function setupThrowable(override: Partial<typeof params> = {}) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { post: jest.mocked(api.post) };
const mocks = { apiAccount, params };

export { mocks, setup, setupThrowable, spies };
