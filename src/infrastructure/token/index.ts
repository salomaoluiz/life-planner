import * as SecureStore from "expo-secure-store";

import { asyncStorage, StorageKeys } from "@infrastructure/storage";
import { isWeb } from "@utils/platform";

// SecureStore keys allow only [A-Za-z0-9._-]
const NATIVE_KEY = "session_token";
const NATIVE_REFRESH_KEY = "session_refresh_token";
const WEB_KEY = StorageKeys.string.SESSION_TOKEN;
const WEB_REFRESH_KEY = StorageKeys.string.SESSION_REFRESH_TOKEN;

// Every request needs the access token: read it from the store once and keep it here until it changes.
// All writers (login, refresh, logout, session expiry) go through this module, so they keep it in sync.
let memoryToken: null | string = null;

async function clearToken(): Promise<void> {
  memoryToken = null;
  if (isWeb()) {
    asyncStorage.deleteItem(WEB_KEY);
    asyncStorage.deleteItem(WEB_REFRESH_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(NATIVE_KEY);
  await SecureStore.deleteItemAsync(NATIVE_REFRESH_KEY);
}

async function getRefreshToken(): Promise<null | string> {
  if (isWeb()) {
    return asyncStorage.getString(WEB_REFRESH_KEY);
  }
  return SecureStore.getItemAsync(NATIVE_REFRESH_KEY);
}

async function getToken(): Promise<null | string> {
  if (memoryToken) {
    return memoryToken;
  }
  // A missing token is not memoized: a login may store one at any moment.
  memoryToken = isWeb()
    ? asyncStorage.getString(WEB_KEY)
    : await SecureStore.getItemAsync(NATIVE_KEY);

  return memoryToken;
}

async function setRefreshToken(token: string): Promise<void> {
  if (isWeb()) {
    asyncStorage.setString(WEB_REFRESH_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(NATIVE_REFRESH_KEY, token);
}

async function setToken(token: string): Promise<void> {
  memoryToken = token;
  if (isWeb()) {
    asyncStorage.setString(WEB_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(NATIVE_KEY, token);
}

const tokenStorage = {
  clearToken,
  getRefreshToken,
  getToken,
  setRefreshToken,
  setToken,
};

export { tokenStorage };
