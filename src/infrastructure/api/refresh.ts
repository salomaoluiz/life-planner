import { GenericError } from "@domain/entities/errors";
import { decode } from "@infrastructure/crypto";
import { tokenStorage } from "@infrastructure/token";

import * as session from "./session";
import { send } from "./transport";

const REFRESH_PATH = "/v1/auth/refresh";
const PROACTIVE_WINDOW_MS = 5 * 60 * 1000;

let inFlight: null | Promise<null | string> = null;

async function expiresSoon(jwt: string): Promise<boolean> {
  try {
    const payload = await decode<{ exp?: unknown }>(jwt.split(".")[1] ?? "");

    return (
      typeof payload.exp === "number" &&
      payload.exp * 1000 - Date.now() <= PROACTIVE_WINDOW_MS
    );
  } catch {
    // Not a decodable JWT: nothing to anticipate, the 401 path still covers it.
    return false;
  }
}

// Parallel callers share one request: a second refresh with the same token would hit the
// lost-response grace at best and reuse detection at worst.
async function refreshAccessToken(sentToken: string): Promise<null | string> {
  inFlight ??= renew(sentToken).finally(() => {
    inFlight = null;
  });

  return inFlight;
}

async function refreshSessionIfNeeded(): Promise<void> {
  try {
    const token = await tokenStorage.getToken();
    if (
      !token ||
      !(await tokenStorage.getRefreshToken()) ||
      !(await expiresSoon(token))
    ) {
      return;
    }
    if (!(await refreshAccessToken(token))) {
      await session.handleSessionExpired(token);
    }
  } catch {
    // Offline or server trouble: keep the session, the data request reports its own error.
  }
}

async function renew(sentToken: string): Promise<null | string> {
  const current = await tokenStorage.getToken();
  // Another request already renewed the pair while this one was in flight.
  if (current && current !== sentToken) {
    return current;
  }

  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const { json, status } = await send(
    "POST",
    REFRESH_PATH,
    { refreshToken },
    null,
  );

  if (status === 401) {
    return null;
  }
  if (
    status < 200 ||
    status >= 300 ||
    typeof json?.token !== "string" ||
    typeof json?.refreshToken !== "string"
  ) {
    const error = new GenericError();
    // Never include the request/response body: it holds the tokens.
    error.addContext({
      method: "POST",
      path: REFRESH_PATH,
      statusCode: status,
    });
    throw error;
  }

  await tokenStorage.setToken(json.token);
  await tokenStorage.setRefreshToken(json.refreshToken);

  return json.token;
}

export { refreshAccessToken, refreshSessionIfNeeded };
