import { getString } from "./gets";
import { setString } from "./sets";

const asyncStorage = {
  getString,
  setString,
};

export { asyncStorage };
export { default as StorageKeys } from "./types";
