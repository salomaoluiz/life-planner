import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import deleteAccount from "../deleteAccount";

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(email = "test@example.com") {
  return deleteAccount(email, datasourcesMocks);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = { userDatasource: jest.mocked(datasourcesMocks.userDatasource) };
const mocks = { email: "test@example.com" };

export { mocks, setup, setupThrowable, spies };
