import { ConnectivityError } from "@domain/entities/errors";

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

async function send(
  method: Method,
  path: string,
  body: unknown,
  token: null | string,
): Promise<{ json?: Record<string, unknown>; status: number }> {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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

    return { json: parseBody(await response.text()), status: response.status };
  } catch {
    throw new ConnectivityError();
  } finally {
    clearTimeout(timer);
  }
}

export type { Method };
export { getBaseUrl, send };
