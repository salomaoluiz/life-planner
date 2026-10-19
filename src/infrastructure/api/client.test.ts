import {
  ApiBusinessError,
  ConnectivityError,
  GenericError,
  UserNotLoggedError,
} from "@domain/entities/errors";

import { mocks, setup, setupThrowable, spies } from "./mocks/client.mocks";

it("SHOULD call BASE_URL + path with JSON headers and parse the JSON body", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(200, { ok: true }));

  const result = await setup("GET", "/v1/user/me");

  expect(result).toEqual({ ok: true });
  expect(spies.fetch).toHaveBeenCalledWith(
    `${mocks.baseUrl}/v1/user/me`,
    expect.objectContaining({
      headers: expect.objectContaining({ Accept: "application/json" }),
      method: "GET",
    }),
  );
});

it("SHOULD send the body as JSON with Content-Type", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(201, undefined));

  await setup("POST", "/v1/auth/login/email", { email: "test@example.com" });

  const init = spies.fetch.mock.calls[0][1] as RequestInit;
  expect(init.body).toBe(JSON.stringify({ email: "test@example.com" }));
  expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
});

it("SHOULD attach the Bearer token WHEN a token is stored", async () => {
  spies.tokenStorage.getToken.mockResolvedValueOnce("jwt");
  spies.fetch.mockResolvedValueOnce(mocks.json(200, {}));

  await setup("GET", "/v1/user/me");

  expect((spies.fetch.mock.calls[0][1] as RequestInit).headers).toMatchObject({
    Authorization: "Bearer jwt",
  });
});

it("SHOULD NOT send Authorization WHEN no token is stored", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(200, {}));

  await setup("GET", "/v1/user/me");

  expect(
    (spies.fetch.mock.calls[0][1] as RequestInit).headers,
  ).not.toHaveProperty("Authorization");
});

it("SHOULD return undefined WHEN the body is empty (201 signup)", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.raw(201, ""));

  expect(await setup("POST", "/v1/auth/signup/email", {})).toBeUndefined();
});

it.each([
  [400, "Validation Failed"],
  [422, "Email already in use"],
  [404, "Not Found"],
])(
  "SHOULD map %s to ApiBusinessError with API message and statusCode",
  async (status, message) => {
    spies.fetch.mockResolvedValueOnce(
      mocks.json(status, { message, statusCode: status }),
    );

    const error = await setupThrowable("GET", "/v1/x");

    expect(error).toBeInstanceOf(ApiBusinessError);
    expect(error).toMatchObject({ message, statusCode: status });
  },
);

it("SHOULD keep ONLY the numeric fields of the error body as details (counts, never free text)", async () => {
  spies.fetch.mockResolvedValueOnce(
    mocks.json(409, {
      detachedCount: 1,
      message: "Paid occurrences",
      note: "free text",
      paidCount: 3,
      paidTotal: 600000,
    }),
  );

  const error = await setupThrowable("DELETE", "/v1/x");

  expect(error).toMatchObject({
    details: { detachedCount: 1, paidCount: 3, paidTotal: 600000 },
    statusCode: 409,
  });
});

it("SHOULD map 401 WITHOUT a stored token to ApiBusinessError and NOT start session expiry (wrong password on login)", async () => {
  spies.fetch.mockResolvedValueOnce(
    mocks.json(401, { message: "Invalid Credentials", statusCode: 401 }),
  );

  const error = await setupThrowable("POST", "/v1/auth/login/email", {});

  expect(error).toBeInstanceOf(ApiBusinessError);
  expect(error).toMatchObject({ statusCode: 401 });
  expect(spies.handleSessionExpired).not.toHaveBeenCalled();
});

it("SHOULD start session expiry and throw UserNotLoggedError WHEN 401 on an authenticated call", async () => {
  spies.tokenStorage.getToken.mockResolvedValueOnce("jwt");
  spies.fetch.mockResolvedValueOnce(
    mocks.json(401, { message: "Unauthorized", statusCode: 401 }),
  );

  const error = await setupThrowable("GET", "/v1/user/me");

  expect(error).toBeInstanceOf(UserNotLoggedError);
  expect(spies.handleSessionExpired).toHaveBeenCalledWith("jwt");
});

it("SHOULD map 5xx to GenericError WITHOUT the response body in the context", async () => {
  spies.fetch.mockResolvedValueOnce(
    mocks.json(500, { message: "secret detail", statusCode: 500 }),
  );

  const error = (await setupThrowable("POST", "/v1/auth/login/email", {
    password: "hunter2hunter2",
  })) as GenericError;

  expect(error).toBeInstanceOf(GenericError);
  expect(error.context).toEqual({
    method: "POST",
    path: "/v1/auth/login/email",
    statusCode: 500,
  });
});

it("SHOULD map a non-JSON 502 (proxy HTML) to GenericError", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.raw(502, "<html>Bad gateway</html>"));

  expect(await setupThrowable("GET", "/v1/x")).toBeInstanceOf(GenericError);
});

it("SHOULD map a network failure to ConnectivityError", async () => {
  spies.fetch.mockRejectedValueOnce(new TypeError("Network request failed"));

  expect(await setupThrowable("GET", "/v1/x")).toBeInstanceOf(
    ConnectivityError,
  );
});

it("SHOULD abort after 15 s and throw ConnectivityError", async () => {
  spies.fetch.mockImplementationOnce(
    async (_url: string, init: RequestInit) =>
      new Promise((_resolve, reject) => {
        init.signal?.addEventListener("abort", () =>
          reject(new Error("aborted")),
        );
      }),
  );

  const promise = setupThrowable("GET", "/v1/slow");
  await jest.advanceTimersByTimeAsync(15_000);

  expect(await promise).toBeInstanceOf(ConnectivityError);
});

it("SHOULD expose get/post/patch/put/delete helpers using the right verbs", async () => {
  spies.fetch.mockResolvedValue(mocks.json(200, {}));

  await mocks.api.get("/v1/a");
  await mocks.api.post("/v1/a", {});
  await mocks.api.patch("/v1/a", {});
  await mocks.api.put("/v1/a", {});
  await mocks.api.delete("/v1/a");

  expect(
    spies.fetch.mock.calls.map((call) => (call[1] as RequestInit).method),
  ).toEqual(["GET", "POST", "PATCH", "PUT", "DELETE"]);
});

it("SHOULD NOT send the stored token to auth endpoints and treat their 401 as wrong credentials", async () => {
  spies.tokenStorage.getToken.mockResolvedValue("stale-jwt");
  spies.fetch.mockResolvedValueOnce(
    mocks.json(401, { message: "Invalid Credentials", statusCode: 401 }),
  );

  const error = await setupThrowable("POST", "/v1/auth/login/email", {});

  expect(
    (spies.fetch.mock.calls[0][1] as RequestInit).headers,
  ).not.toHaveProperty("Authorization");
  expect(error).toBeInstanceOf(ApiBusinessError);
  expect(error).toMatchObject({ statusCode: 401 });
  expect(spies.handleSessionExpired).not.toHaveBeenCalled();
});

it("SHOULD redact the invite token from the GenericError context path on a 5xx", async () => {
  const token = "q3Jx0b9S2v1mA8kQ7rT4yU6pL5nW0zE3cF2hD1gB9aI";
  spies.fetch.mockResolvedValueOnce(mocks.json(500, { message: "boom" }));

  const error = await setupThrowable(
    "POST",
    `/v1/family-invites/${token}/accept`,
  );

  expect(error).toBeInstanceOf(GenericError);
  expect(error).toHaveProperty("context", {
    method: "POST",
    path: "/v1/family-invites/:token/accept",
    statusCode: 500,
  });
  expect(JSON.stringify((error as GenericError).context)).not.toContain(token);
});

it("SHOULD keep other paths untouched in the GenericError context", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(500, {}));

  const error = await setupThrowable("GET", "/v1/families/1/members");

  expect(error).toHaveProperty("context", {
    method: "GET",
    path: "/v1/families/1/members",
    statusCode: 500,
  });
});

it("SHOULD send the JSON body and Content-Type on DELETE WHEN a body is given", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(204, undefined));

  await setup("DELETE", "/v1/user/me", { email: "test@example.com" });

  const init = spies.fetch.mock.calls[0][1] as RequestInit;
  expect(init.method).toBe("DELETE");
  expect(init.body).toBe(JSON.stringify({ email: "test@example.com" }));
  expect(init.headers).toMatchObject({ "Content-Type": "application/json" });
});

it("SHOULD send no body and no Content-Type on DELETE WHEN no body is given", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(204, undefined));

  await setup("DELETE", "/v1/a");

  const init = spies.fetch.mock.calls[0][1] as RequestInit;
  expect(init.body).toBeUndefined();
  expect(init.headers).not.toHaveProperty("Content-Type");
});

it("SHOULD resolve undefined on a 204 with an empty body AND reject a 422 with ApiBusinessError", async () => {
  spies.fetch.mockResolvedValueOnce(mocks.json(204, undefined));
  expect(
    await setup("DELETE", "/v1/user/me", { email: "a@example.com" }),
  ).toBeUndefined();

  spies.fetch.mockResolvedValueOnce(
    mocks.json(422, { message: "Email does not match", statusCode: 422 }),
  );
  const error = await setupThrowable("DELETE", "/v1/user/me", {
    email: "b@example.com",
  });

  expect(error).toBeInstanceOf(ApiBusinessError);
  expect(error).toMatchObject({
    message: "Email does not match",
    statusCode: 422,
  });
});

describe("GIVEN a 401 with a stored refresh token", () => {
  const refreshed = { refreshToken: "r2", token: "new" };

  beforeEach(() => {
    spies.tokenStorage.getRefreshToken.mockResolvedValue("refresh");
  });

  it("SHOULD refresh once, retry the request with the new token and return its result", async () => {
    spies.tokenStorage.getToken
      .mockResolvedValueOnce("old") // original request
      .mockResolvedValueOnce("old") // refresh: stored token is still the failed one
      .mockResolvedValueOnce("new"); // retry reads the renewed token
    spies.fetch
      .mockResolvedValueOnce(mocks.json(401, {}))
      .mockResolvedValueOnce(mocks.json(200, refreshed))
      .mockResolvedValueOnce(mocks.json(200, { ok: true }));

    expect(await setup("GET", "/v1/user/me")).toEqual({ ok: true });
    expect(spies.fetch).toHaveBeenCalledTimes(3);
    expect(spies.fetch.mock.calls[1][0]).toBe(
      `${mocks.baseUrl}/v1/auth/refresh`,
    );
    expect((spies.fetch.mock.calls[2][1] as RequestInit).headers).toMatchObject(
      { Authorization: "Bearer new" },
    );
    expect(spies.handleSessionExpired).not.toHaveBeenCalled();
  });

  it("SHOULD cause exactly ONE refresh call for parallel 401s", async () => {
    let renewed = false;
    spies.tokenStorage.getToken.mockImplementation(async () =>
      renewed ? "new" : "old",
    );
    spies.tokenStorage.setToken.mockImplementation(async () => {
      renewed = true;
    });
    spies.fetch.mockImplementation(async (url: string, init: RequestInit) => {
      if (url.endsWith("/v1/auth/refresh")) {
        return mocks.json(200, refreshed);
      }
      const bearer = (init.headers as Record<string, string>).Authorization;
      return bearer === "Bearer new"
        ? mocks.json(200, { ok: true })
        : mocks.json(401, {});
    });

    const results = await Promise.all([
      setup("GET", "/v1/a"),
      setup("GET", "/v1/b"),
      setup("GET", "/v1/c"),
    ]);

    expect(results).toEqual([{ ok: true }, { ok: true }, { ok: true }]);
    const refreshCalls = spies.fetch.mock.calls.filter(([url]) =>
      (url as string).endsWith("/v1/auth/refresh"),
    );
    expect(refreshCalls).toHaveLength(1);
  });

  it("SHOULD end the session AND throw UserNotLoggedError WHEN the refresh is refused (401)", async () => {
    spies.tokenStorage.getToken.mockResolvedValue("old");
    spies.fetch
      .mockResolvedValueOnce(mocks.json(401, {}))
      .mockResolvedValueOnce(mocks.json(401, {}));

    expect(await setupThrowable("GET", "/v1/user/me")).toBeInstanceOf(
      UserNotLoggedError,
    );
    expect(spies.handleSessionExpired).toHaveBeenCalledWith("old");
  });

  it("SHOULD NOT retry twice: a 401 on the retried request ends the session", async () => {
    spies.tokenStorage.getToken
      .mockResolvedValueOnce("old")
      .mockResolvedValueOnce("old")
      .mockResolvedValue("new");
    spies.fetch
      .mockResolvedValueOnce(mocks.json(401, {}))
      .mockResolvedValueOnce(mocks.json(200, refreshed))
      .mockResolvedValueOnce(mocks.json(401, {}));

    expect(await setupThrowable("GET", "/v1/user/me")).toBeInstanceOf(
      UserNotLoggedError,
    );
    expect(spies.fetch).toHaveBeenCalledTimes(3);
    expect(spies.handleSessionExpired).toHaveBeenCalledWith("new");
  });

  it("SHOULD surface ConnectivityError AND keep the session WHEN the refresh fails offline", async () => {
    spies.tokenStorage.getToken.mockResolvedValue("old");
    spies.fetch
      .mockResolvedValueOnce(mocks.json(401, {}))
      .mockRejectedValueOnce(new Error("offline"));

    expect(await setupThrowable("GET", "/v1/user/me")).toBeInstanceOf(
      ConnectivityError,
    );
    expect(spies.handleSessionExpired).not.toHaveBeenCalled();
    expect(spies.tokenStorage.clearToken).not.toHaveBeenCalled();
  });

  it("SHOULD surface GenericError AND keep the session WHEN the refresh answers 5xx", async () => {
    spies.tokenStorage.getToken.mockResolvedValue("old");
    spies.fetch
      .mockResolvedValueOnce(mocks.json(401, {}))
      .mockResolvedValueOnce(mocks.json(503, {}));

    expect(await setupThrowable("GET", "/v1/user/me")).toBeInstanceOf(
      GenericError,
    );
    expect(spies.handleSessionExpired).not.toHaveBeenCalled();
  });
});

it("SHOULD NOT try to refresh a 401 from /v1/auth/* (no token is sent, no loop)", async () => {
  spies.tokenStorage.getToken.mockResolvedValue("jwt");
  spies.tokenStorage.getRefreshToken.mockResolvedValue("refresh");
  spies.fetch.mockResolvedValueOnce(
    mocks.json(401, { message: "Invalid Credentials" }),
  );

  expect(
    await setupThrowable("POST", "/v1/auth/login/email", {}),
  ).toBeInstanceOf(ApiBusinessError);
  expect(spies.fetch).toHaveBeenCalledTimes(1);
});
