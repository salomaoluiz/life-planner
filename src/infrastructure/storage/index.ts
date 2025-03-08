import { getString } from "./gets";
import { setString } from "./sets";

const asyncStorage = {
  setString,
  getString,
};

export { asyncStorage };
export { default as StorageKeys } from "./types";
