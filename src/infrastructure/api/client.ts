import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";
import { tokenStorage } from "@infrastructure/token";

import * as session from "./session";

const REQUEST_TIMEOUT_MS = 15_000;

type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

function getBaseUrl() {
  // Direct read is inlined by Expo at build time; the alias keeps it readable at runtime (tests).
  const envs = process.env;
  const url = process.env.EXPO_PUBLIC_API_URL ?? envs.EXPO_PUBLIC_API_URL;

  if (!url) {
    throw new Error("Missing EXPO_PUBLIC_API_URL");
  }

  return url.replace(/\/+$/, "");
}

function parseBody(text: string): Record<string, unknown> | undefined {
  if (!text) {
    return undefined;
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return undefined;
  }
}

const INVITE_TOKEN_SEGMENT = /(\/family-invites\/)[^/?#]+/;

// The invite token is a secret that travels in the URL path: keep it out of error contexts.
function redactPath(path: string) {
  return path.replace(INVITE_TOKEN_SEGMENT, "$1:token");
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
): Promise<T> {
  const baseUrl = getBaseUrl();
  // Auth endpoints are public: never send a (possibly stale) token to them.
  const token = path.startsWith("/v1/auth/")
    ? null
    : await tokenStorage.getToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let status: number;
  let json: Record<string, unknown> | undefined;

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: "application/json",
        ...(body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      method,
      signal: controller.signal,
    });
    status = response.status;
    json = parseBody(await response.text());
  } catch {
    throw new ConnectivityError();
  } finally {
    clearTimeout(timer);
  }

  if (status >= 200 && status < 300) {
    return json as T;
  }

  if (status === 401 && token) {
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
  throw new ApiBusinessError(message, status);
}

const api = {
  delete: async <T>(path: string) => request<T>("DELETE", path),
  get: async <T>(path: string) => request<T>("GET", path),
  patch: async <T>(path: string, body?: unknown) =>
    request<T>("PATCH", path, body),
  post: async <T>(path: string, body?: unknown) =>
    request<T>("POST", path, body),
  put: async <T>(path: string, body?: unknown) => request<T>("PUT", path, body),
};

export { api };
