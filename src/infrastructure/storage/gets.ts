import AsyncStorage from "@react-native-async-storage/async-storage";

import { StorageGetString } from "./types";

async function getString(
  ...props: Parameters<StorageGetString>
): ReturnType<StorageGetString> {
  return await AsyncStorage.getItem(props[0]);
}

export { getString };
