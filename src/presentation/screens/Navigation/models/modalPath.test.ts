import {
  buildModalPath,
  fallbackBase,
  isValidBase,
  MODAL_NAMES,
  screenPath,
  splitModalPath,
  VALID_BASES,
} from "./modalPath";

describe("splitModalPath", () => {
  it.each([
    ["/financial/overview/add_new_transaction", "/financial/overview"],
    ["/add_new_transaction", "/"],
    ["/invite?token=abc", "/"],
    ["/financial/overview/add_new_transaction/?id=1", "/financial/overview"],
    ["/settings/versions", "/settings"],
  ])("SHOULD split %s with the base %s", (path, base) => {
    expect(splitModalPath(path)?.base).toBe(base);
  });

  it("SHOULD name the modal AND keep the unvalidated base", () => {
    expect(splitModalPath("/foo/add_new_transaction")).toEqual({
      base: "/foo",
      modal: "add_new_transaction",
      rawBase: "/foo",
    });
  });

  it("SHOULD return null WHEN the last segment is not a modal", () => {
    expect(splitModalPath("/financial/overview")).toBeNull();
    expect(splitModalPath("/")).toBeNull();
  });
});

describe("isValidBase", () => {
  it("SHOULD accept exactly the ten bases", () => {
    expect(VALID_BASES).toHaveLength(10);
    VALID_BASES.forEach((base) => expect(isValidBase(base)).toBe(true));
    expect(isValidBase("")).toBe(true);
    expect(isValidBase("/stock/")).toBe(true);
  });

  it.each(["/foo", "/financial/account", "/financial"])(
    "SHOULD reject %s",
    (base) => {
      expect(isValidBase(base)).toBe(false);
    },
  );
});

describe("buildModalPath", () => {
  it("SHOULD join base AND modal", () => {
    expect(buildModalPath("/", "quick_add")).toBe("/quick_add");
    expect(buildModalPath("/stock", "quick_add")).toBe("/stock/quick_add");
    expect(buildModalPath("/stock/", "quick_add")).toBe("/stock/quick_add");
  });
});

describe("fallbackBase", () => {
  it("SHOULD keep a valid base AND fall back to Home otherwise", () => {
    expect(fallbackBase({ modal: "add_new_account", rawBase: "/stock" })).toBe(
      "/stock",
    );
    expect(
      fallbackBase({ modal: "add_new_account", rawBase: "/financial/account" }),
    ).toBe("/");
  });

  it("SHOULD put the invite over Family WHEN it has no base", () => {
    expect(fallbackBase({ modal: "invite", rawBase: "/" })).toBe("/family");
  });
});

it("SHOULD have 18 unique modal names", () => {
  expect(MODAL_NAMES).toHaveLength(18);
  expect(new Set(MODAL_NAMES).size).toBe(18);
});

describe("screenPath", () => {
  it("SHOULD drop the modal segment AND keep plain paths", () => {
    expect(screenPath("/financial/cards/invoice_detail")).toBe(
      "/financial/cards",
    );
    expect(screenPath("/financial/cards")).toBe("/financial/cards");
    expect(screenPath("/quick_add")).toBe("/");
  });
});
