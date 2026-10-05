import toOwnerQuery from "./ownerQuery";

it("SHOULD build repeated ownerId params", () => {
  expect(toOwnerQuery(["a", "b"])).toBe("?ownerId=a&ownerId=b");
});

it("SHOULD build a single param", () => {
  expect(toOwnerQuery(["a"])).toBe("?ownerId=a");
});

it("SHOULD return an empty string for no owners", () => {
  expect(toOwnerQuery([])).toBe("");
});

it("SHOULD URL-encode ids", () => {
  expect(toOwnerQuery(["a b&c"])).toBe("?ownerId=a%20b%26c");
});
