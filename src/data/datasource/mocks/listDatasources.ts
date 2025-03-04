import { Datasources } from "@data/datasource";

const datasourcesMocks: jest.MockedObjectDeep<Datasources> = {
  loginDatasource: {
    loginWithOAuth: jest.fn(),
    loginWithIdToken: jest.fn(),
    saveSession: jest.fn(),
    logout: jest.fn(),
  },
  userDatasource: {
    getUser: jest.fn(),
  },
};

export { datasourcesMocks };
