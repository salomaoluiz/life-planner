import * as cacheDelete from "./delete";
import * as cacheGet from "./get";
import * as cacheSet from "./set";

const cache = {
  ...cacheDelete,
  ...cacheGet,
  ...cacheSet,
};

export default cache;
export { CacheStringKeys } from "./types";
