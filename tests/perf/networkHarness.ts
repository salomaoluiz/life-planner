// Request-budget harness: replaces the HTTP transport under `@infrastructure/api` with a recorder whose calls stay
// pending until `flush()` answers them round by round. The real API client still runs (token, sharing of identical
// GETs), so what is counted is what would reach the network. A round is every request in flight at the same time:
// the number of rounds is the depth of the waterfall a user waits for.
//
// Usage in a test file (jest.mock is hoisted, so require it inside the factory):
//   jest.mock("@infrastructure/api/transport", () => jest.requireActual("@tests/perf/networkHarness").transportMock);
//   jest.mock("@infrastructure/api/refresh", () => jest.requireActual("@tests/perf/networkHarness").refreshMock);

type Method = "DELETE" | "GET" | "PATCH" | "POST" | "PUT";

interface PendingCall {
  method: Method;
  path: string;
  reject: (error: unknown) => void;
  resolve: (value: unknown) => void;
}

type Responder = (method: Method, path: string) => unknown;

interface Stats {
  // Same method + path sent more than once in the measured window.
  duplicates: number;
  // Number of rounds that sent at least one request (waterfall depth).
  rounds: number;
  total: number;
}

let pending: PendingCall[] = [];
let log: { method: Method; path: string; round: number }[] = [];
let round = 0;
let respond: Responder = emptyResponse;

function emptyResponse(): unknown {
  return [];
}

async function record(method: Method, path: string) {
  return new Promise((resolve, reject) => {
    log.push({ method, path, round });
    pending.push({ method, path, reject, resolve });
  });
}

const transportMock = {
  getBaseUrl: () => "http://api.test",
  send: async (method: Method, path: string) => ({
    json: await record(method, path),
    status: 200,
    text: "",
  }),
};

// The session never needs renewing in a measurement.
const refreshMock = {
  refreshAccessToken: async () => null,
  refreshSessionIfNeeded: async () => undefined,
};

// Starts a measured window: the counters only see what is sent from here on.
function count(classify: (path: string, method: Method) => boolean) {
  return log.filter(({ method, path }) => classify(path, method)).length;
}

// Answers the requests in flight, round after round, until the app stops sending. `act` wraps each step so React
// processes the state updates.
async function flush(act: (callback: () => Promise<void>) => Promise<void>) {
  await act(settle);
  for (let guard = 0; guard < 20 && pending.length > 0; guard += 1) {
    const batch = pending;

    pending = [];
    round += 1;
    await act(async () => {
      batch.forEach((call) => {
        try {
          call.resolve(respond(call.method, call.path));
        } catch (error) {
          call.reject(error);
        }
      });
      await settle();
    });
  }
}

function mark() {
  log = [];
  round = 0;
}

function requests() {
  return log.map(({ method, path }) => `${method} ${path}`);
}

function reset(responder: Responder) {
  pending = [];
  respond = responder;
  mark();
}

// Lets the app react (effects, query observers, promise chains) until nothing new is sent.
async function settle() {
  let quiet = 0;
  let last = log.length;

  while (quiet < 3) {
    await tick();
    if (log.length === last) {
      quiet += 1;
    } else {
      quiet = 0;
      last = log.length;
    }
  }
}

function stats(): Stats {
  const seen = new Map<string, number>();

  log.forEach(({ method, path }) => {
    const key = `${method} ${path}`;

    seen.set(key, (seen.get(key) ?? 0) + 1);
  });

  return {
    duplicates: [...seen.values()].reduce((sum, count) => sum + (count - 1), 0),
    rounds: new Set(log.map((entry) => entry.round)).size,
    total: log.length,
  };
}

async function tick() {
  await new Promise((resolve) => setTimeout(resolve, 5));
}

export {
  count,
  flush,
  mark,
  refreshMock,
  requests,
  reset,
  stats,
  transportMock,
};
export type { Method, Stats };
