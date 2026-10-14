import {
  extractStep,
  formatDuration,
  parseJUnit,
  readTags,
} from "./summarize.mjs";
import { junit, manyFlows, setup } from "./summarize.mocks";

describe("parseJUnit", () => {
  it("SHOULD read passed and failed flows", () => {
    const { flows } = parseJUnit(
      junit([{ name: "a/b" }, { failure: "boom", name: "c/d" }]),
    );

    expect(flows).toEqual([
      { failed: false, message: "", name: "a/b" },
      { failed: true, message: "boom", name: "c/d" },
    ]);
  });

  it("SHOULD decode XML entities AND CDATA in the failure text", () => {
    const xml = junit([
      { failure: "a &lt;b&gt; &amp; <![CDATA[<raw & text>]]>", name: "a/b" },
    ]);

    expect(parseJUnit(xml).flows[0].message).toBe("a <b> & <raw & text>");
  });

  it("SHOULD count a skipped flow as failed", () => {
    const xml =
      '<testsuite><testcase name="a/b"><skipped/></testcase></testsuite>';

    expect(parseJUnit(xml).flows[0].failed).toBe(true);
  });

  it("SHOULD throw WHEN the report is malformed", () => {
    expect(() => parseJUnit("<html>nope")).toThrow("no <testsuite> element");
  });
});

describe("helpers", () => {
  it.each([
    [45, "45s"],
    [192, "3m12s"],
    [60, "1m0s"],
  ])("SHOULD format %i seconds as %s", (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected);
  });

  it("SHOULD read the tag list from the flow header only", () => {
    const yaml =
      "name: x\ntags:\n  - stock\n  - spec-005\n---\n- tapOn: a\n  - not-a-tag\n";

    expect(readTags(yaml)).toEqual(["stock", "spec-005"]);
  });

  it("SHOULD extract the step WHEN the failure text has one AND return null otherwise", () => {
    expect(extractStep('Element not found\nStep: tapOn id "save"')).toBe(
      'tapOn id "save"',
    );
    expect(extractStep("Element not found")).toBeNull();
  });
});

describe("buildSummary", () => {
  it("SHOULD print exactly one line WHEN every flow passed", () => {
    const result = setup({
      cases: manyFlows(48, 0),
      revisions: "app main@a1b2c3d · api main@9f8e7d6+dirty",
    });

    expect(result.text).toBe(
      "E2E PASSED: 48/48 flows (3m12s) · app main@a1b2c3d · api main@9f8e7d6+dirty",
    );
    expect(result.exitCode).toBe(0);
    expect(result.failedFiles).toEqual([]);
  });

  it("SHOULD print the header AND one block of at most 6 lines WHEN one flow failed", () => {
    const result = setup({
      artifactFiles: [
        "e2e-report/artifacts/stock_edit-item/screenshot-edit-item.png",
        "e2e-report/artifacts/stock_edit-item/maestro.log",
      ],
      cases: [
        { name: "a/b" },
        {
          failure:
            'Element not found: id "stock.item.save-button"\nStep: tapOn id "stock.item.save-button"',
          name: "stock/edit-item",
        },
      ],
    });

    const lines = result.text.split("\n");
    expect(lines[0]).toBe(
      "E2E FAILED: 1 of 2 flows failed (3m12s). Re-run failures only: yarn e2e:failed",
    );
    expect(lines.slice(2)).toEqual([
      "1. stock/edit-item  [stock, spec-005]",
      "   file: e2e/flows/stock/edit-item.yaml",
      '   step: tapOn id "stock.item.save-button"',
      '   error: Element not found: id "stock.item.save-button"',
      "   screenshot: e2e-report/artifacts/stock_edit-item/screenshot-edit-item.png",
      "   log: e2e-report/artifacts/stock_edit-item/maestro.log",
    ]);
    expect(result.exitCode).toBe(1);
    expect(result.failedFiles).toEqual(["e2e/flows/stock/edit-item.yaml"]);
  });

  it("SHOULD never list passing flows", () => {
    const result = setup({
      cases: [{ name: "pass/one" }, { failure: "x", name: "stock/edit-item" }],
    });

    expect(result.text).not.toContain("pass/one");
  });

  it("SHOULD list 15 blocks AND a +5 more line WHEN 20 of 100 flows failed", () => {
    const result = setup({ cases: manyFlows(100, 20) });

    expect(result.text.match(/^\d+\. /gm)).toHaveLength(15);
    expect(result.text).toContain(
      "+5 more failed flows, see e2e-report/failed.txt",
    );
    expect(result.failedFiles).toHaveLength(20);
  });

  it("SHOULD report LIKELY ENVIRONMENT FAILURE AND list 3 blocks WHEN more than half failed", () => {
    const result = setup({ cases: manyFlows(10, 6) });

    expect(
      result.text.startsWith(
        "LIKELY ENVIRONMENT FAILURE: 6 of 10 flows failed",
      ),
    ).toBe(true);
    expect(result.text.match(/^\d+\. /gm)).toHaveLength(3);
    expect(result.text).toContain("+3 more failed flows");
  });

  it("SHOULD NOT report an environment failure WHEN exactly half failed", () => {
    expect(
      setup({ cases: manyFlows(10, 5) }).text.startsWith("E2E FAILED"),
    ).toBe(true);
  });

  it("SHOULD cut the error to 300 characters on one line WHEN the message is long AND multi-line", () => {
    const result = setup({
      cases: [
        {
          failure: `${"x".repeat(400)}\nsecond line`,
          name: "stock/edit-item",
        },
      ],
    });
    const errorLine = result.text
      .split("\n")
      .find((line) => line.startsWith("   error: "));

    expect(errorLine.slice("   error: ".length)).toHaveLength(300);
    expect(result.text).not.toContain("second line");
  });

  it("SHOULD still print a block WHEN the flow file does not exist", () => {
    const result = setup({
      cases: [{ failure: "boom", name: "odd name/with spaces" }],
    });

    expect(result.text).toContain(
      "1. odd name/with spaces\n   file: e2e/flows/odd name/with spaces.yaml",
    );
    expect(result.failedFiles).toEqual(["e2e/flows/odd name/with spaces.yaml"]);
  });
});
