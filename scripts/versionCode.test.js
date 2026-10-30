import { versionCode } from "./versionCode";

it.each([
  ["1.0.0", 10000],
  ["1.1.0", 10100],
  ["1.12.3", 11203],
  ["2.0.0", 20000],
])("SHOULD turn %s into versionCode %i", (version, expected) => {
  expect(versionCode(version)).toBe(expected);
});
