import * as network from "../../tests/perf/networkHarness";

async function act(callback: () => Promise<void>) {
  await callback();
}

async function send(path: string, method: network.Method = "GET") {
  return network.transportMock.send(method, path);
}

beforeAll(() => {
  jest.useRealTimers();
});

beforeEach(() => {
  network.reset(() => ({ ok: true }));
});

describe("networkHarness", () => {
  it("SHOULD count the waterfall levels as rounds", async () => {
    const first = Promise.all([send("/v1/a"), send("/v1/b")]).then(async () =>
      send("/v1/c"),
    );

    await network.flush(act);
    await first;

    expect(network.stats()).toEqual({ duplicates: 0, rounds: 2, total: 3 });
  });

  it("SHOULD count the same method and path sent more than once as duplicates", async () => {
    const calls = Promise.all([send("/v1/a"), send("/v1/a"), send("/v1/a")]);

    await network.flush(act);
    await calls;

    expect(network.stats().duplicates).toBe(2);
    expect(network.requests()).toEqual(["GET /v1/a", "GET /v1/a", "GET /v1/a"]);
  });

  it("SHOULD apply the classifier to the recorded requests", async () => {
    const calls = Promise.all([send("/v1/a"), send("/v1/a?from=1")]);

    await network.flush(act);
    await calls;

    expect(
      network.count(
        (path) => path.startsWith("/v1/a") && !path.includes("from="),
      ),
    ).toBe(1);
  });

  it("SHOULD ignore earlier calls after mark", async () => {
    const before = send("/v1/a");

    await network.flush(act);
    await before;
    network.mark();

    expect(network.stats()).toEqual({ duplicates: 0, rounds: 0, total: 0 });
  });

  it("SHOULD reject the call WHEN the responder throws", async () => {
    network.reset(() => {
      throw new Error("boom");
    });
    const outcome = expect(send("/v1/a")).rejects.toThrow("boom");

    await network.flush(act);
    await outcome;
  });
});
