import { tokenStorage } from "@infrastructure/token";

import { api } from "../index";
import * as session from "../session";

jest.mock("@infrastructure/token", () => ({
  tokenStorage: {
    clearToken: jest.fn(),
    getToken: jest.fn().mockResolvedValue(null),
    setToken: jest.fn(),
  },
}));

const baseUrl = "http://api.test/api";
process.env.EXPO_PUBLIC_API_URL = `${baseUrl}/`; // trailing slash must be tolerated

const fetchSpy = jest.fn();
global.fetch = fetchSpy as unknown as typeof fetch;
const handleSessionExpiredSpy = jest
  .spyOn(session, "handleSessionExpired")
  .mockResolvedValue();

type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

function json(status: number, body: unknown) {
  return raw(status, body === undefined ? "" : JSON.stringify(body));
}

function raw(status: number, text: string) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => text,
  } as Response;
}

const calls: Record<
  Method,
  (path: string, body?: unknown) => Promise<unknown>
> = {
  DELETE: async (path) => api.delete(path),
  GET: async (path) => api.get(path),
  PATCH: async (path, body) => api.patch(path, body),
  POST: async (path, body) => api.post(path, body),
  PUT: async (path, body) => api.put(path, body),
};

async function setup(method: Method, path: string, body?: unknown) {
  return calls[method](path, body);
}

async function setupThrowable(method: Method, path: string, body?: unknown) {
  try {
    await setup(method, path, body);
  } catch (error) {
    return error;
  }
}

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(tokenStorage.getToken).mockResolvedValue(null);
});

const spies = {
  fetch: fetchSpy,
  handleSessionExpired: handleSessionExpiredSpy,
  tokenStorage: jest.mocked(tokenStorage),
};
const mocks = { api, baseUrl, json, raw };

export { mocks, setup, setupThrowable, spies };
