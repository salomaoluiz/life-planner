import { parseE2eLoginFragment } from "./parseFragment";

describe("parseE2eLoginFragment", () => {
  it("SHOULD read token and refresh from the fragment", () => {
    expect(parseE2eLoginFragment("#token=a&refresh=b")).toEqual({
      refresh: "b",
      token: "a",
    });
  });

  it("SHOULD accept a fragment without refresh", () => {
    expect(parseE2eLoginFragment("#token=a")).toEqual({
      refresh: undefined,
      token: "a",
    });
  });

  it.each(["", "#refresh=b", "#token="])(
    "SHOULD return null for %p",
    (hash) => {
      expect(parseE2eLoginFragment(hash)).toBeNull();
    },
  );
});
