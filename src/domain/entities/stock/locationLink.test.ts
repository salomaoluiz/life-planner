import { locationLink } from "./locationLink";

it("SHOULD join the web host and the location path without a double slash", () => {
  expect(locationLink("https://app.example.com/", "abc")).toBe(
    "https://app.example.com/stock/locations/abc",
  );
});

it("SHOULD keep a relative link WHEN there is no host", () => {
  expect(locationLink(undefined, "a b")).toBe("/stock/locations/a%20b");
});
