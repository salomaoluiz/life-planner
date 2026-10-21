import { ConnectivityError } from "@domain/entities/errors";

const REQUEST_TIMEOUT_MS = 15_000;

type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

interface SendResult {
  // The `filename` of a `Content-Disposition` attachment (the CSV export, spec 047).
  filename?: string;
  json?: Record<string, unknown>;
  status: number;
  // The raw body, for a text response.
  text: string;
}

function filenameOf(disposition: null | string): string | undefined {
  return /filename="?([^";]+)"?/.exec(disposition ?? "")?.[1];
}

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
): Promise<SendResult> {
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

    const text = await response.text();

    return {
      filename: filenameOf(
        response.headers?.get("content-disposition") ?? null,
      ),
      json: parseBody(text),
      status: response.status,
      text,
    };
  } catch {
    throw new ConnectivityError();
  } finally {
    clearTimeout(timer);
  }
}

export type { Method, SendResult };
export { getBaseUrl, send };
