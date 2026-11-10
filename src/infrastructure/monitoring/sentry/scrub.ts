// Spec 106 (5.1): nothing personal or financial may reach Sentry.
const REDACTED = "[redacted]";

const FORBIDDEN_KEYS = new Set([
  "accesstoken",
  "amount",
  "authorization",
  "body",
  "description",
  "email",
  "name",
  "notes",
  "password",
  "refreshtoken",
  "token",
]);

const SEARCH_PARAM = /((?:^|[?&])q=)[^&#]*/g;

interface ScrubbableEvent {
  breadcrumbs?: unknown[];
  contexts?: unknown;
  extra?: unknown;
  request?: Record<string, unknown>;
  user?: { id?: string };
}

// `q` carries the search text typed by the user.
function redactSearch(value: string): string {
  return value.replace(SEARCH_PARAM, `$1${REDACTED}`);
}

function scrub<T>(value: T): T {
  return scrubValue(value, new WeakSet()) as T;
}

function scrubEvent<T extends object>(input: T): T {
  const event = input as ScrubbableEvent;
  const result: ScrubbableEvent = { ...event };

  if (event.request) {
    const { headers, ...request } = event.request;
    delete request.cookies;
    delete request.data;
    const safeHeaders = Object.fromEntries(
      Object.entries((headers ?? {}) as Record<string, unknown>).filter(
        ([key]) => !["authorization", "cookie"].includes(key.toLowerCase()),
      ),
    );

    result.request = scrub({ ...request, headers: safeHeaders });
  }

  if (event.breadcrumbs) result.breadcrumbs = scrub(event.breadcrumbs);
  if (event.contexts) result.contexts = scrub(event.contexts);
  if (event.extra) result.extra = scrub(event.extra);
  // Only the id identifies the user.
  if (event.user) result.user = { id: event.user.id };

  return result as T;
}

function scrubValue(value: unknown, seen: WeakSet<object>): unknown {
  if (typeof value === "string") {
    return redactSearch(value);
  }

  if (typeof value !== "object" || value === null) {
    return value;
  }

  if (seen.has(value)) {
    return "[circular]";
  }
  seen.add(value);

  if (Array.isArray(value)) {
    return value.map((item) => scrubValue(item, seen));
  }

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !FORBIDDEN_KEYS.has(key.toLowerCase()))
      .map(([key, item]) => [key, scrubValue(item, seen)]),
  );
}

export { redactSearch, scrub, scrubEvent };
