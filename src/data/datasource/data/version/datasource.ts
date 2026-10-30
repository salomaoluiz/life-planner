import { getVersionInfo } from "./api";

export default function versionDatasource() {
  return { getVersionInfo };
}
