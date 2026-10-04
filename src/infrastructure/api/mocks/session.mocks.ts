import cache from "@infrastructure/cache";
import { tokenStorage } from "@infrastructure/token";

import * as session from "../session";

jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

const invalidateAllSpy = jest
  .spyOn(cache, "invalidateAll")
  .mockImplementation(jest.fn());

beforeEach(() => {
  jest.clearAllMocks();
  session.clearSessionExpiredNotice();
});

const spies = {
  invalidateAll: invalidateAllSpy,
  tokenStorage: jest.mocked(tokenStorage),
};

export { session as setup, spies };
