import { tokenStorage } from "@infrastructure/token";

import { subscribeToEvents } from "./index";

jest.mock("@infrastructure/api/transport", () => ({
  getBaseUrl: () => "http://api.test",
}));
jest.mock("@infrastructure/token", () => ({
  tokenStorage: { getToken: jest.fn() },
}));

class FakeRequest {
  static all: FakeRequest[] = [];

  aborted = false;
  headers: Record<string, string> = {};
  onerror?: () => void;
  onloadend?: () => void;
  onprogress?: () => void;
  onreadystatechange?: () => void;
  readyState = 1;
  responseText = "";
  status = 0;
  url = "";

  constructor() {
    FakeRequest.all.push(this);
  }

  abort() {
    this.aborted = true;
  }

  open(_method: string, url: string) {
    this.url = url;
  }

  send() {}

  setRequestHeader(name: string, value: string) {
    this.headers[name] = value;
  }
}

const original = global.XMLHttpRequest;

beforeEach(() => {
  jest.useFakeTimers();
  FakeRequest.all = [];
  (global as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest =
    FakeRequest;
  jest.mocked(tokenStorage.getToken).mockResolvedValue("jwt");
});
afterEach(() => {
  jest.useRealTimers();
  global.XMLHttpRequest = original;
});

async function connected(options: Parameters<typeof subscribeToEvents>[0]) {
  const stop = subscribeToEvents(options);

  await jest.advanceTimersByTimeAsync(0);

  return { request: FakeRequest.all[FakeRequest.all.length - 1], stop };
}

it("SHOULD send the token in the Authorization header (never in the URL) AND report CONNECTED", async () => {
  const onStatus = jest.fn();
  const { request } = await connected({
    onMessage: jest.fn(),
    onResync: jest.fn(),
    onStatus,
    path: "/v1/stock/shopping-lists/l/events",
  });

  request.status = 200;
  request.readyState = 2;
  request.onreadystatechange?.();

  expect(request.headers.Authorization).toBe("Bearer jwt");
  expect(request.url).toBe("http://api.test/v1/stock/shopping-lists/l/events");
  expect(onStatus).toHaveBeenCalledWith("CONNECTING");
  expect(onStatus).toHaveBeenCalledWith("CONNECTED");
});

it("SHOULD deliver the messages as they arrive AND call resync", async () => {
  const onMessage = jest.fn();
  const onResync = jest.fn();
  const { request } = await connected({ onMessage, onResync, path: "/p" });

  request.responseText = "id: 3\nevent: row.upserted\ndata: {}\n\n";
  request.onprogress?.();
  request.responseText += "event: resync\ndata: {}\n\n";
  request.onprogress?.();

  expect(onMessage).toHaveBeenCalledWith({
    data: "{}",
    event: "row.upserted",
    id: "3",
  });
  expect(onResync).toHaveBeenCalledTimes(1);
});

it("SHOULD reconnect with the last event id after a backoff AND reset the backoff after a clean end", async () => {
  const { request } = await connected({
    onMessage: jest.fn(),
    onResync: jest.fn(),
    path: "/p",
  });

  request.responseText = "id: 9\nevent: x\ndata: {}\n\n";
  request.onprogress?.();
  request.status = 200;
  request.onloadend?.();
  await jest.advanceTimersByTimeAsync(1400);

  expect(FakeRequest.all).toHaveLength(2);
  expect(FakeRequest.all[1].headers["Last-Event-ID"]).toBe("9");

  FakeRequest.all[1].onerror?.();
  await jest.advanceTimersByTimeAsync(2600);
  expect(FakeRequest.all).toHaveLength(3);
});

it("SHOULD stop reconnecting AND abort the open request WHEN unsubscribed", async () => {
  const { request, stop } = await connected({
    onMessage: jest.fn(),
    onResync: jest.fn(),
    path: "/p",
  });

  stop();
  request.onloadend?.();
  await jest.advanceTimersByTimeAsync(70_000);

  expect(request.aborted).toBe(true);
  expect(FakeRequest.all).toHaveLength(1);
});

it("SHOULD not open a request WHEN stopped before the token arrives", async () => {
  const stop = subscribeToEvents({
    onMessage: jest.fn(),
    onResync: jest.fn(),
    path: "/p",
  });

  stop();
  await jest.advanceTimersByTimeAsync(0);

  expect(FakeRequest.all).toHaveLength(0);
});
