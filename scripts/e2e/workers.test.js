import { parseDurations, resolveWorkers, splitFlows } from "./workers.mjs";

describe("splitFlows", () => {
  it("SHOULD put the heaviest flows on different workers", () => {
    const durations = {
      "a.yaml": 160,
      "b.yaml": 150,
      "c.yaml": 10,
      "d.yaml": 5,
    };

    expect(
      splitFlows(["a.yaml", "b.yaml", "c.yaml", "d.yaml"], durations, 2),
    ).toEqual([
      ["a.yaml", "d.yaml"],
      ["b.yaml", "c.yaml"],
    ]);
  });

  it("SHOULD count 40s for flows with no known duration AND drop empty workers", () => {
    expect(splitFlows(["a.yaml"], {}, 3)).toEqual([["a.yaml"]]);
    expect(splitFlows(["a.yaml", "b.yaml"], { "a.yaml": 100 }, 2)).toEqual([
      ["a.yaml"],
      ["b.yaml"],
    ]);
  });
});

describe("parseDurations", () => {
  it("SHOULD read file and time of every testcase", () => {
    const xml =
      '<testsuite><testcase id="x" file="e2e/flows/a.yaml" time="33.677" status="SUCCESS"></testcase><testcase file="e2e/flows/b.yaml" time="2" /></testsuite>';

    expect(parseDurations(xml)).toEqual({
      "e2e/flows/a.yaml": 33.677,
      "e2e/flows/b.yaml": 2,
    });
  });
});

describe("resolveWorkers", () => {
  it("SHOULD prefer the option, then E2E_WORKERS, then 2", () => {
    expect(resolveWorkers({ env: { E2E_WORKERS: "3" }, option: "4" })).toBe(4);
    expect(resolveWorkers({ env: { E2E_WORKERS: "3" } })).toBe(3);
    expect(resolveWorkers({ env: {} })).toBe(2);
    expect(resolveWorkers({ env: { E2E_WORKERS: "x" }, option: "0" })).toBe(2);
  });
});
