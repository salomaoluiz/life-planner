import {
  ApiBusinessError,
  BusinessError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { DEFAULT_GC_TIME, DEFAULT_STALE_TIME, shouldRetry } from "./provider";

jest.unmock("@tanstack/react-query");

it("SHOULD keep results fresh for 30 s AND in memory for 10 min by default", () => {
  const { queryClient } = jest.requireActual("./provider");
  const defaults = queryClient.getDefaultOptions().queries;

  expect(DEFAULT_STALE_TIME).toBe(30000);
  expect(DEFAULT_GC_TIME).toBe(600000);
  expect(defaults.staleTime).toBe(DEFAULT_STALE_TIME);
  expect(defaults.gcTime).toBe(DEFAULT_GC_TIME);
  expect(defaults.retry).toBe(shouldRetry);
});

it.each([
  ["a lost connection", new ConnectivityError()],
  ["a server or unknown error", new GenericError()],
  ["a plain Error", new Error("boom")],
])("SHOULD retry %s once", (_label, error) => {
  expect(shouldRetry(0, error)).toBe(true);
  expect(shouldRetry(1, error)).toBe(false);
});

it.each([
  ["a 4xx answer", new ApiBusinessError("Not found", 404)],
  ["a business rule", new BusinessError()],
  ["a missing session", new UserNotLoggedError()],
])("SHOULD NOT retry %s", (_label, error) => {
  expect(shouldRetry(0, error)).toBe(false);
});
