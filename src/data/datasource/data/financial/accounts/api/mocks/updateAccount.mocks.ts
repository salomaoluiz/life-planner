import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { api } from "@infrastructure/api";

import updateAccount from "../updateAccount";

jest.mock("@infrastructure/api", () => ({
  api: { patch: jest.fn() },
}));

// region mocks
const id = "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10";
const params = {
  balance: 1520.75,
  icon: "bank",
  id,
  name: "Checking",
  owner: OwnerType.USER,
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  status: AccountStatus.ARCHIVED,
};
const onlyId = {
  balance: undefined,
  icon: undefined,
  name: undefined,
  owner: undefined,
  ownerId: undefined,
  status: undefined,
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(
  override: Partial<Parameters<typeof updateAccount>[0]> = {},
) {
  return updateAccount({ ...params, ...override });
}

async function setupThrowable(
  override: Partial<Parameters<typeof updateAccount>[0]> = {},
) {
  try {
    await setup(override);
  } catch (error) {
    return error;
  }
}

const spies = { patch: jest.mocked(api.patch) };
const mocks = { id, onlyId, params };

export { mocks, setup, setupThrowable, spies };
