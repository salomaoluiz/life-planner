import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import accountRepositoryImpl from "./accountRepositoryImpl";
import createAccount from "./createAccount";
import deleteAccount from "./deleteAccount";
import getAccounts from "./getAccounts";
import updateAccount from "./updateAccount";

jest.mock("./createAccount", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("./deleteAccount", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("./getAccounts", () => ({ __esModule: true, default: jest.fn() }));
jest.mock("./updateAccount", () => ({ __esModule: true, default: jest.fn() }));

const accountParams = {
  balance: 100,
  icon: "bank",
  name: "Checking",
  owner: OwnerType.USER,
  ownerId: "owner-1",
  status: AccountStatus.ACTIVE,
};

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD expose repository methods", () => {
  const repo = accountRepositoryImpl(datasourcesMocks);
  expect(repo).toHaveProperty("createAccount");
  expect(repo).toHaveProperty("deleteAccount");
  expect(repo).toHaveProperty("getAccounts");
  expect(repo).toHaveProperty("updateAccount");
});

it("SHOULD delegate createAccount with the params and datasources", async () => {
  const created = { id: "acc-1" };
  jest.mocked(createAccount).mockResolvedValueOnce(created as never);

  const result =
    await accountRepositoryImpl(datasourcesMocks).createAccount(accountParams);

  expect(createAccount).toHaveBeenCalledWith(accountParams, datasourcesMocks);
  expect(result).toBe(created);
});

it("SHOULD delegate deleteAccount with the params and datasources", async () => {
  const params = { id: "acc-1", ownerId: "owner-1" };

  await accountRepositoryImpl(datasourcesMocks).deleteAccount(params);

  expect(deleteAccount).toHaveBeenCalledWith(params, datasourcesMocks);
});

it("SHOULD delegate getAccounts with the owner ids and datasources", async () => {
  const accounts = [{ id: "acc-1" }];
  jest.mocked(getAccounts).mockResolvedValueOnce(accounts as never);

  const result = await accountRepositoryImpl(datasourcesMocks).getAccounts([
    "owner-1",
  ]);

  expect(getAccounts).toHaveBeenCalledWith(["owner-1"], datasourcesMocks);
  expect(result).toBe(accounts);
});

it("SHOULD delegate updateAccount with the params and datasources", async () => {
  const params = { ...accountParams, id: "acc-1" };

  await accountRepositoryImpl(datasourcesMocks).updateAccount(params);

  expect(updateAccount).toHaveBeenCalledWith(params, datasourcesMocks);
});
