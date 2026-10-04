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
