import { StorageGetString } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";

async function getString(
  ...props: Parameters<StorageGetString>
): ReturnType<StorageGetString> {
  return await AsyncStorage.getItem(props[0]);
}

export { getString };
