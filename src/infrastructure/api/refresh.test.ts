import { ConnectivityError, GenericError } from "@domain/entities/errors";

import { mocks, setup, spies } from "./mocks/refresh.mocks";

const pair = { refreshToken: "new-refresh", token: "new-access" };

describe("refreshAccessToken", () => {
  beforeEach(() => {
    spies.tokenStorage.getToken.mockResolvedValue("old-access");
    spies.tokenStorage.getRefreshToken.mockResolvedValue("old-refresh");
  });

  it("SHOULD post the refresh token WITHOUT Authorization, store the new pair and return the new access token", async () => {
    spies.fetch.mockResolvedValueOnce(mocks.json(200, pair));

    expect(await setup.refreshAccessToken("old-access")).toBe("new-access");

    const [url, init] = spies.fetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${mocks.baseUrl}/v1/auth/refresh`);
    expect(init.body).toBe(JSON.stringify({ refreshToken: "old-refresh" }));
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(spies.tokenStorage.setToken).toHaveBeenCalledWith("new-access");
    expect(spies.tokenStorage.setRefreshToken).toHaveBeenCalledWith(
      "new-refresh",
    );
  });

  it("SHOULD share ONE request among parallel callers", async () => {
    spies.fetch.mockResolvedValueOnce(mocks.json(200, pair));

    const results = await Promise.all([
      setup.refreshAccessToken("old-access"),
      setup.refreshAccessToken("old-access"),
      setup.refreshAccessToken("old-access"),
    ]);

    expect(results).toEqual(["new-access", "new-access", "new-access"]);
    expect(spies.fetch).toHaveBeenCalledTimes(1);
  });

  it("SHOULD allow a new refresh after the previous one finished", async () => {
    spies.fetch.mockResolvedValue(mocks.json(200, pair));

    await setup.refreshAccessToken("old-access");
    await setup.refreshAccessToken("old-access");

    expect(spies.fetch).toHaveBeenCalledTimes(2);
  });

  it("SHOULD NOT call the API WHEN the stored access token is already newer than the one that failed", async () => {
    spies.tokenStorage.getToken.mockResolvedValue("already-renewed");

    expect(await setup.refreshAccessToken("old-access")).toBe(
      "already-renewed",
    );
    expect(spies.fetch).not.toHaveBeenCalled();
  });

  it("SHOULD return null WITHOUT calling the API WHEN there is no refresh token (old API)", async () => {
    spies.tokenStorage.getRefreshToken.mockResolvedValue(null);

    expect(await setup.refreshAccessToken("old-access")).toBeNull();
    expect(spies.fetch).not.toHaveBeenCalled();
  });

  it("SHOULD return null AND keep the stored tokens WHEN the API answers 401", async () => {
    spies.fetch.mockResolvedValueOnce(mocks.json(401, { message: "x" }));

    expect(await setup.refreshAccessToken("old-access")).toBeNull();
    expect(spies.tokenStorage.setToken).not.toHaveBeenCalled();
    expect(spies.tokenStorage.clearToken).not.toHaveBeenCalled();
  });

  it("SHOULD throw ConnectivityError on network failure AND keep the tokens", async () => {
    spies.fetch.mockRejectedValueOnce(new Error("offline"));

    await expect(setup.refreshAccessToken("old-access")).rejects.toBeInstanceOf(
      ConnectivityError,
    );
    expect(spies.tokenStorage.setToken).not.toHaveBeenCalled();
  });

  it("SHOULD throw GenericError (no body in the context) on 5xx", async () => {
    spies.fetch.mockResolvedValueOnce(mocks.json(500, { token: "leak" }));

    const error = await setup.refreshAccessToken("old-access").catch((e) => e);

    expect(error).toBeInstanceOf(GenericError);
    expect(JSON.stringify(error.context)).not.toContain("leak");
    expect(error.context).toMatchObject({ statusCode: 500 });
  });

  it("SHOULD throw GenericError WHEN a 200 lacks the token pair, storing nothing", async () => {
    spies.fetch.mockResolvedValueOnce(mocks.json(200, { token: "only" }));

    await expect(setup.refreshAccessToken("old-access")).rejects.toBeInstanceOf(
      GenericError,
    );
    expect(spies.tokenStorage.setToken).not.toHaveBeenCalled();
  });
});

describe("refreshSessionIfNeeded", () => {
  beforeEach(() => {
    spies.tokenStorage.getRefreshToken.mockResolvedValue("old-refresh");
  });

  it("SHOULD do nothing WHEN there is no access token OR no refresh token", async () => {
    spies.tokenStorage.getToken.mockResolvedValue(null);
    await setup.refreshSessionIfNeeded();

    spies.tokenStorage.getToken.mockResolvedValue(mocks.makeJwt(-60));
    spies.tokenStorage.getRefreshToken.mockResolvedValue(null);
    await setup.refreshSessionIfNeeded();

    expect(spies.fetch).not.toHaveBeenCalled();
  });

  it("SHOULD do nothing WHEN the access token expires in more than 5 minutes", async () => {
    spies.tokenStorage.getToken.mockResolvedValue(mocks.makeJwt(3600));

    await setup.refreshSessionIfNeeded();

    expect(spies.fetch).not.toHaveBeenCalled();
  });

  it.each([-60, 240])(
    "SHOULD refresh WHEN the access token expires in %i seconds",
    async (seconds) => {
      spies.tokenStorage.getToken.mockResolvedValue(mocks.makeJwt(seconds));
      spies.fetch.mockResolvedValueOnce(mocks.json(200, pair));

      await setup.refreshSessionIfNeeded();

      expect(spies.fetch).toHaveBeenCalledTimes(1);
      expect(spies.tokenStorage.setToken).toHaveBeenCalledWith("new-access");
    },
  );

  it.each([
    ["not a JWT", "not-a-jwt"],
    ["garbage payload", "a.b.c"],
    ["no exp", mocks.makeJwtFrom({ user: { id: "x" } })],
    ["non-numeric exp", mocks.makeJwtFrom({ exp: "soon" })],
  ])(
    "SHOULD NOT crash NOR refresh WHEN the access token is %s",
    async (_name, token) => {
      spies.tokenStorage.getToken.mockResolvedValue(token);

      await expect(setup.refreshSessionIfNeeded()).resolves.toBeUndefined();
      expect(spies.fetch).not.toHaveBeenCalled();
    },
  );

  it("SHOULD end the session WHEN the refresh is refused with 401", async () => {
    const token = mocks.makeJwt(-60);
    spies.tokenStorage.getToken.mockResolvedValue(token);
    spies.fetch.mockResolvedValueOnce(mocks.json(401, {}));

    await setup.refreshSessionIfNeeded();

    expect(spies.handleSessionExpired).toHaveBeenCalledWith(token);
  });

  it("SHOULD keep the session AND resolve WHEN offline or 5xx", async () => {
    spies.tokenStorage.getToken.mockResolvedValue(mocks.makeJwt(-60));
    spies.fetch.mockRejectedValueOnce(new Error("offline"));
    await expect(setup.refreshSessionIfNeeded()).resolves.toBeUndefined();

    spies.fetch.mockResolvedValueOnce(mocks.json(503, {}));
    await expect(setup.refreshSessionIfNeeded()).resolves.toBeUndefined();

    expect(spies.handleSessionExpired).not.toHaveBeenCalled();
  });
});
