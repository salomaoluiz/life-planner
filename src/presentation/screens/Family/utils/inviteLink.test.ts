import { buildInviteLink, truncateMiddle } from "./inviteLink";

it("SHOULD build the link from the website url and the token", () => {
  expect(buildInviteLink("https://app.example.test", "abc_DEF-123")).toBe(
    "https://app.example.test/invite?token=abc_DEF-123",
  );
});

it("SHOULD not double the slash WHEN the base url ends with one", () => {
  expect(buildInviteLink("https://app.example.test/", "abc")).toBe(
    "https://app.example.test/invite?token=abc",
  );
});

it("SHOULD build a relative link WHEN the base url is not configured", () => {
  expect(buildInviteLink(undefined, "abc")).toBe("/invite?token=abc");
});

it("SHOULD keep short text and cut the middle of long text", () => {
  expect(truncateMiddle("short", 10)).toBe("short");
  const result = truncateMiddle(
    "https://app.example.test/invite?token=abcdefghij",
    21,
  );
  expect(result).toHaveLength(21);
  expect(result).toContain("…");
  expect(result.startsWith("https://ap")).toBe(true);
  expect(result.endsWith("efghij")).toBe(true);
});
