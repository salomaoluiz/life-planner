import { datasourcesMocks } from "@data/datasource/mocks/index.mocks";

import accountRepositoryImpl from "./accountRepositoryImpl";

it("SHOULD expose repository methods", () => {
  const repo = accountRepositoryImpl(datasourcesMocks);
  expect(repo).toHaveProperty("createAccount");
  expect(repo).toHaveProperty("deleteAccount");
  expect(repo).toHaveProperty("getAccounts");
  expect(repo).toHaveProperty("updateAccount");
});
