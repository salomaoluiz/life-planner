import AsyncStorage from "@react-native-async-storage/async-storage";

import { StorageSetString } from "./types";

async function setString(
  ...props: Parameters<StorageSetString>
): ReturnType<StorageSetString> {
  await AsyncStorage.setItem(props[0], props[1]);
}

export { setString };
