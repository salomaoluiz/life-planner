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
  it("SHOULD accept exactly the sixteen bases (the investments Overview joined in spec 110, Settings in spec 113, the stock Lists and Catalog in spec 118, Waste in spec 123)", () => {
    expect(VALID_BASES).toHaveLength(16);
    VALID_BASES.forEach((base) => expect(isValidBase(base)).toBe(true));
    expect(isValidBase("")).toBe(true);
    expect(isValidBase("/stock/")).toBe(true);
  });

  it("SHOULD accept the detail of an asset as a base (spec 102)", () => {
    expect(isValidBase("/investments/asset/asset-1")).toBe(true);
    expect(isValidBase("/investments/asset/asset-1/")).toBe(true);
    expect(isValidBase("/investments/asset/asset-1/extra")).toBe(false);
    expect(isValidBase("/investments/investment_asset")).toBe(false);
    expect(
      splitModalPath("/investments/asset/asset-1/investment_operation"),
    ).toMatchObject({
      base: "/investments/asset/asset-1",
      modal: "investment_operation",
    });
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

it("SHOULD have 39 unique modal names", () => {
  expect(MODAL_NAMES).toHaveLength(39);
  expect(new Set(MODAL_NAMES).size).toBe(39);
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

it("SHOULD accept a modal opened over the investments Overview AND keep the asset list base (spec 110)", () => {
  expect(isValidBase("/investments/overview")).toBe(true);
  expect(isValidBase("/investments")).toBe(true);
  expect(
    splitModalPath("/investments/overview/investment_asset"),
  ).toMatchObject({ base: "/investments/overview", modal: "investment_asset" });
  expect(buildModalPath("/investments/overview", "investment_asset")).toBe(
    "/investments/overview/investment_asset",
  );
});

it("SHOULD accept the detail of a shopping list as a modal base (spec 118)", () => {
  expect(isValidBase("/stock/list/abc")).toBe(true);
  expect(isValidBase("/stock/list/abc/extra")).toBe(false);
  expect(isValidBase("/stock/purchases/abc")).toBe(true);
  expect(isValidBase("/stock/purchases/abc/extra")).toBe(false);
});
