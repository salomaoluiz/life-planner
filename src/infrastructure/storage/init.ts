import { MMKV, Mode } from "react-native-mmkv";

export const storage = new MMKV({
  id: "global-storage",
});

export const cache = new MMKV({
  id: "cache-storage",
  mode: Mode.MULTI_PROCESS,
});
