import {
  ApiBusinessError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";
import { tokenStorage } from "@infrastructure/token";

import * as refresh from "./refresh";
import * as session from "./session";
import { getBaseUrl, type Method, send, type SendResult } from "./transport";

const INVITE_TOKEN_SEGMENT = /(\/family-invites\/)[^/?#]+/;

async function execute(
  method: Method,
  path: string,
  body?: unknown,
  retried = false,
): Promise<SendResult> {
  getBaseUrl(); // fail fast on a missing config, before touching storage
  // Auth endpoints are public: never send a (possibly stale) token to them.
  const token = path.startsWith("/v1/auth/")
    ? null
    : await tokenStorage.getToken();
  const result = await send(method, path, body, token);
  const { json, status } = result;

  if (status >= 200 && status < 300) {
    return result;
  }

  if (status === 401 && token) {
    // May throw ConnectivityError/GenericError: the original request then fails with that error
    // and the tokens are kept (being offline must not log the user out).
    if (!retried && (await refresh.refreshAccessToken(token))) {
      return execute(method, path, body, true);
    }
    await session.handleSessionExpired(token);
    throw new UserNotLoggedError();
  }

  if (status >= 500 || status < 400) {
    const error = new GenericError();
    // Never include the request/response body: it can hold credentials or personal data.
    error.addContext({ method, path: redactPath(path), statusCode: status });
    throw error;
  }

  const message =
    typeof json?.message === "string" ? json.message : "Request failed";
  throw new ApiBusinessError(message, status, numericDetails(json), json ?? {});
}

// Only the numeric fields of an error body (counts); text could hold personal data.
function numericDetails(json?: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(json ?? {}).filter(([, value]) => typeof value === "number"),
  ) as Record<string, number>;
}

// The invite token is a secret that travels in the URL path: keep it out of error contexts.
function redactPath(path: string) {
  return path.replace(INVITE_TOKEN_SEGMENT, "$1:token");
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  return (await execute(method, path, body)).json as T;
}

const api = {
  delete: async <T>(path: string, body?: unknown) =>
    request<T>("DELETE", path, body),
  get: async <T>(path: string) => request<T>("GET", path),
  // A text response (the CSV export, spec 047) with the attachment filename the API chose.
  getText: async (path: string) => {
    const { filename, text } = await execute("GET", path);

    return { filename, text };
  },
  patch: async <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, body),
  post: async <T>(path: string, body?: unknown) =>
    request<T>("POST", path, body),
  put: async <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
};

export { api };
