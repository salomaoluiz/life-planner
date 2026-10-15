import { tokenStorage } from "@infrastructure/token";

import * as refresh from "../refresh";
import * as session from "../session";

jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getRefreshToken: jest.fn(),
    getToken: jest.fn(),
    setRefreshToken: jest.fn(),
    setToken: jest.fn(),
  },
}));

const baseUrl = "http://api.test/api";
process.env.EXPO_PUBLIC_API_URL = baseUrl;

const fetchSpy = jest.fn();
global.fetch = fetchSpy as unknown as typeof fetch;
const handleSessionExpiredSpy = jest
  .spyOn(session, "handleSessionExpired")
  .mockResolvedValue();

function json(status: number, body: unknown) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(body),
  } as Response;
}

function makeJwt(expSecondsFromNow: number) {
  return makeJwtFrom({
    exp: Math.floor(Date.now() / 1000) + expSecondsFromNow,
  });
}

function makeJwtFrom(payload: Record<string, unknown>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `header.${encoded}.signature`;
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(tokenStorage.getToken).mockReset();
  jest.mocked(tokenStorage.getRefreshToken).mockReset();
  handleSessionExpiredSpy.mockResolvedValue();
});

const spies = {
  fetch: fetchSpy,
  handleSessionExpired: handleSessionExpiredSpy,
  tokenStorage: jest.mocked(tokenStorage),
};
const mocks = { baseUrl, json, makeJwt, makeJwtFrom };

export { mocks, refresh as setup, spies };
