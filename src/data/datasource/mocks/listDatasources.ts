import { Datasources } from "@data/datasource";

const datasourcesMocks: jest.MockedObjectDeep<Datasources> = {
  loginDatasource: {
    loginWithIdToken: jest.fn(),
    loginWithOAuth: jest.fn(),
    logout: jest.fn(),
    saveSession: jest.fn(),
  },
  userDatasource: {
    getUser: jest.fn(),
  },
};

export { datasourcesMocks };
