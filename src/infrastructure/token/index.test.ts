import { mocks, setup, spies } from "./mocks/index.mocks";

describe("GIVEN a native platform", () => {
  beforeEach(() => {
    mocks.platform.isWeb.mockReturnValue(false);
  });

  it("SHOULD store the token in SecureStore", async () => {
    await setup().setToken("jwt");

    expect(spies.secureStore.setItemAsync).toHaveBeenCalledWith(
      "session_token",
      "jwt",
    );
    expect(spies.asyncStorage.setString).not.toHaveBeenCalled();
  });

  it("SHOULD read the token from SecureStore", async () => {
    spies.secureStore.getItemAsync.mockResolvedValueOnce("jwt");

    expect(await setup().getToken()).toBe("jwt");
    expect(spies.secureStore.getItemAsync).toHaveBeenCalledWith(
      "session_token",
    );
  });

  it("SHOULD delete the token from SecureStore", async () => {
    await setup().clearToken();

    expect(spies.secureStore.deleteItemAsync).toHaveBeenCalledWith(
      "session_token",
    );
    expect(spies.secureStore.deleteItemAsync).toHaveBeenCalledWith(
      "session_refresh_token",
    );
  });

  it("SHOULD store and read the refresh token under its own key", async () => {
    await setup().setRefreshToken("refresh");
    expect(spies.secureStore.setItemAsync).toHaveBeenCalledWith(
      "session_refresh_token",
      "refresh",
    );

    spies.secureStore.getItemAsync.mockResolvedValueOnce("refresh");
    expect(await setup().getRefreshToken()).toBe("refresh");
    expect(spies.secureStore.getItemAsync).toHaveBeenCalledWith(
      "session_refresh_token",
    );
  });
});

describe("GIVEN the web platform", () => {
  beforeEach(() => {
    mocks.platform.isWeb.mockReturnValue(true);
  });

  it("SHOULD store the token with the storage wrapper", async () => {
    await setup().setToken("jwt");

    expect(spies.asyncStorage.setString).toHaveBeenCalledWith(
      "@session_token",
      "jwt",
    );
    expect(spies.secureStore.setItemAsync).not.toHaveBeenCalled();
  });

  it("SHOULD return null WHEN no token is stored", async () => {
    spies.asyncStorage.getString.mockReturnValueOnce(null);

    expect(await setup().getToken()).toBeNull();
  });

  it("SHOULD read and delete via the storage wrapper", async () => {
    spies.asyncStorage.getString.mockReturnValueOnce("jwt");

    expect(await setup().getToken()).toBe("jwt");
    await setup().clearToken();
    expect(spies.asyncStorage.deleteItem).toHaveBeenCalledWith(
      "@session_token",
    );
    expect(spies.asyncStorage.deleteItem).toHaveBeenCalledWith(
      "@session_refresh_token",
    );
  });

  it("SHOULD store and read the refresh token with the storage wrapper", async () => {
    await setup().setRefreshToken("refresh");
    expect(spies.asyncStorage.setString).toHaveBeenCalledWith(
      "@session_refresh_token",
      "refresh",
    );

    spies.asyncStorage.getString.mockReturnValueOnce("refresh");
    expect(await setup().getRefreshToken()).toBe("refresh");
    expect(spies.asyncStorage.getString).toHaveBeenCalledWith(
      "@session_refresh_token",
    );
  });
});

describe("GIVEN the access token is read repeatedly", () => {
  beforeEach(() => {
    mocks.platform.isWeb.mockReturnValue(false);
  });

  it("SHOULD read the store only once", async () => {
    spies.secureStore.getItemAsync.mockResolvedValue("jwt");

    expect(await setup().getToken()).toBe("jwt");
    expect(await setup().getToken()).toBe("jwt");
    expect(spies.secureStore.getItemAsync).toHaveBeenCalledTimes(1);
  });

  it("SHOULD return the new token WHEN setToken ran after a read", async () => {
    spies.secureStore.getItemAsync.mockResolvedValue("old");
    await setup().getToken();

    await setup().setToken("new");

    expect(await setup().getToken()).toBe("new");
    expect(spies.secureStore.getItemAsync).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT serve a cleared token AND read the store again", async () => {
    spies.secureStore.getItemAsync.mockResolvedValue("jwt");
    await setup().getToken();

    await setup().clearToken();
    spies.secureStore.getItemAsync.mockResolvedValue(null);

    expect(await setup().getToken()).toBeNull();
    expect(spies.secureStore.getItemAsync).toHaveBeenCalledTimes(2);
  });

  it("SHOULD NOT memoize a missing token", async () => {
    spies.secureStore.getItemAsync.mockResolvedValueOnce(null);
    expect(await setup().getToken()).toBeNull();

    spies.secureStore.getItemAsync.mockResolvedValueOnce("late");

    expect(await setup().getToken()).toBe("late");
  });
});

describe("GIVEN the monitoring user (spec 106)", () => {
  // payload {"user":{"id":"user-id"}}
  const jwt = `header.${btoa(JSON.stringify({ user: { id: "user-id" } }))}.sig`;

  beforeEach(() => {
    mocks.platform.isWeb.mockReturnValue(false);
  });

  it("SHOULD identify the user by id WHEN a token is stored", async () => {
    await setup().setToken(jwt);

    expect(spies.setUser).toHaveBeenCalledWith({ id: "user-id" });
  });

  it("SHOULD identify the user WHEN a stored session is restored", async () => {
    spies.secureStore.getItemAsync.mockResolvedValueOnce(jwt);

    await setup().getToken();

    expect(spies.setUser).toHaveBeenCalledWith({ id: "user-id" });
  });

  it("SHOULD clear the user WHEN the token is cleared", async () => {
    await setup().clearToken();

    expect(spies.setUser).toHaveBeenCalledWith(null);
  });

  it("SHOULD clear the user WHEN the token is not a readable JWT", async () => {
    await setup().setToken("jwt");

    expect(spies.setUser).toHaveBeenCalledWith(null);
  });
});
