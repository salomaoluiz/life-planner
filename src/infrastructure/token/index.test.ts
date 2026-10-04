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
  });
});
