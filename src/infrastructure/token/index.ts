import * as SecureStore from "expo-secure-store";

import { asyncStorage, StorageKeys } from "@infrastructure/storage";
import { isWeb } from "@utils/platform";

// SecureStore keys allow only [A-Za-z0-9._-]
const NATIVE_KEY = "session_token";
const WEB_KEY = StorageKeys.string.SESSION_TOKEN;

async function clearToken(): Promise<void> {
  if (isWeb()) {
    asyncStorage.deleteItem(WEB_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(NATIVE_KEY);
}

async function getToken(): Promise<null | string> {
  if (isWeb()) {
    return asyncStorage.getString(WEB_KEY);
  }
  return SecureStore.getItemAsync(NATIVE_KEY);
}

async function setToken(token: string): Promise<void> {
  if (isWeb()) {
    asyncStorage.setString(WEB_KEY, token);
    return;
  }
  await SecureStore.setItemAsync(NATIVE_KEY, token);
}

const tokenStorage = { clearToken, getToken, setToken };

export { tokenStorage };
