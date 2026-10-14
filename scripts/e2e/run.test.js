import { buildMaestroArgs, parseArgs, runE2e } from "./run.mjs";
import { createDeps, enabledEnv } from "./run.mocks";
import { junit, manyFlows } from "./summarize.mocks";

async function run(overrides, { argv = [], env = enabledEnv } = {}) {
  const { deps, printed, written } = createDeps(overrides);
  const exitCode = await runE2e({ argv, env }, deps);
  return { deps, exitCode, printed, written };
}

describe("parseArgs AND buildMaestroArgs", () => {
  it("SHOULD parse --tags and --failed", () => {
    expect(parseArgs(["--tags", "auth,smoke", "--failed"])).toEqual({
      failedOnly: true,
      headless: false,
      listTags: false,
      tags: ["auth", "smoke"],
    });
    expect(parseArgs([])).toEqual({
      failedOnly: false,
      headless: false,
      listTags: false,
      tags: [],
    });
  });

  it("SHOULD parse --headless", () => {
    expect(parseArgs(["--headless"]).headless).toBe(true);
  });

  it("SHOULD include the tags AND exclude wip by default", () => {
    const args = buildMaestroArgs({
      apiUrl: "http://a/api",
      failedOnly: false,
      junitPath: "j.xml",
      tags: ["auth"],
      target: "e2e/flows",
      webUrl: "http://w",
    });

    expect(args).toEqual(
      expect.arrayContaining([
        "--include-tags",
        "auth",
        "--exclude-tags",
        "wip",
      ]),
    );
    expect(args).toEqual(
      expect.arrayContaining([
        "-e",
        "E2E_API_URL=http://a/api",
        "E2E_WEB_URL=http://w",
      ]),
    );
  });

  it("SHOULD run on web with the workspace config for a directory target, and headless only on request", () => {
    const base = {
      apiUrl: "a",
      failedOnly: false,
      junitPath: "j",
      tags: [],
      webUrl: "w",
    };

    expect(buildMaestroArgs({ ...base, target: "e2e/flows" })).toEqual(
      expect.arrayContaining([
        "--platform",
        "web",
        "--config",
        "e2e/config.yaml",
      ]),
    );
    expect(buildMaestroArgs({ ...base, target: "e2e/flows" })).not.toContain(
      "--headless",
    );
    expect(
      buildMaestroArgs({ ...base, headless: true, target: "e2e/flows" }),
    ).toContain("--headless");
    expect(
      buildMaestroArgs({ ...base, target: "e2e/flows/x.yaml" }),
    ).not.toContain("--config");
  });

  it("SHOULD NOT exclude wip WHEN wip is requested", () => {
    const args = buildMaestroArgs({
      apiUrl: "a",
      failedOnly: false,
      junitPath: "j",
      tags: ["wip"],
      target: "e2e/flows",
      webUrl: "w",
    });

    expect(args).not.toContain("--exclude-tags");
  });

  it("SHOULD NOT filter by tags WHEN re-running failed flows", () => {
    const args = buildMaestroArgs({
      apiUrl: "a",
      failedOnly: true,
      junitPath: "j",
      tags: [],
      target: "e2e/flows/x.yaml",
      webUrl: "w",
    });

    expect(args).not.toContain("--include-tags");
    expect(args).not.toContain("--exclude-tags");
  });
});

describe("runE2e preconditions", () => {
  it("SHOULD refuse AND not touch anything WHEN E2E_ENABLED is not true", async () => {
    const { deps, exitCode, printed } = await run({}, { env: {} });

    expect(printed).toEqual(["E2E NOT RUN: E2E runs only on the owner's Mac"]);
    expect(exitCode).toBe(2);
    expect(deps.fetchStatus).not.toHaveBeenCalled();
    expect(deps.exec).not.toHaveBeenCalled();
  });

  it("SHOULD stop WHEN the backend folder is missing", async () => {
    const { exitCode, printed } = await run({
      deps: { exists: jest.fn(() => false) },
    });

    expect(printed).toEqual(["E2E NOT RUN: ../life-planner-back not found"]);
    expect(exitCode).toBe(2);
  });

  it("SHOULD stop WHEN maestro is not installed", async () => {
    const { exitCode, printed } = await run({
      deps: { hasCommand: jest.fn(() => false) },
    });

    expect(printed[0]).toMatch(/^E2E NOT RUN: maestro is not installed/);
    expect(exitCode).toBe(2);
  });

  it("SHOULD stop WHEN the API does not answer", async () => {
    const fetchStatus = jest.fn(async (url) =>
      url.includes("/health") ? null : 200,
    );
    const { deps, exitCode, printed } = await run({ deps: { fetchStatus } });

    expect(printed).toEqual([
      "E2E NOT RUN: API not reachable at http://localhost:3000/api, start it with yarn start:dev",
    ]);
    expect(exitCode).toBe(2);
    expect(deps.exec).not.toHaveBeenCalled();
  });

  it("SHOULD stop WHEN the app does not answer", async () => {
    const fetchStatus = jest.fn(async (url) =>
      url.includes("/health") ? 200 : null,
    );
    const { exitCode, printed } = await run({ deps: { fetchStatus } });

    expect(printed).toEqual([
      "E2E NOT RUN: app not reachable at http://localhost:8081, start it with yarn web",
    ]);
    expect(exitCode).toBe(2);
  });

  it("SHOULD treat a 503 health answer AND a trailing slash in E2E_API_URL as a reachable API", async () => {
    const fetchStatus = jest.fn(async () => 503);
    const { deps, exitCode } = await run(
      { deps: { fetchStatus } },
      { env: { ...enabledEnv, E2E_API_URL: "http://localhost:3000/api/" } },
    );

    expect(fetchStatus).toHaveBeenCalledWith(
      "http://localhost:3000/api/health",
    );
    expect(deps.exec).toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });
});

describe("runE2e execution", () => {
  it("SHOULD print only the one-line summary AND exit 0 WHEN every flow passed", async () => {
    const { deps, exitCode, printed, written } = await run({});

    expect(printed).toEqual(["E2E PASSED: 1/1 flows (3m12s)"]);
    expect(written["e2e-report/summary.md"]).toBe(
      "E2E PASSED: 1/1 flows (3m12s)\n",
    );
    expect(written["e2e-report/failed.txt"]).toBe("");
    expect(exitCode).toBe(0);
    expect(deps.exec).toHaveBeenCalledWith(
      expect.objectContaining({
        command: "maestro",
        logFile: "e2e-report/maestro.log",
      }),
    );
  });

  it("SHOULD remove stale report files BEFORE running Maestro", async () => {
    const order = [];
    const { deps } = await run({
      deps: {
        exec: jest.fn(() => {
          order.push("exec");
          return { status: 0 };
        }),
        removeReportFiles: jest.fn(() => order.push("remove")),
      },
    });

    expect(order).toEqual(["remove", "exec"]);
    expect(deps.exec).toHaveBeenCalledTimes(1);
  });

  it("SHOULD exit 1 AND write failed.txt WHEN a flow failed", async () => {
    const xml = junit([
      { failure: "Element not found", name: "auth/login" },
      { name: "auth/signup" },
    ]);
    const { exitCode, printed, written } = await run({
      files: { "e2e-report/junit.xml": xml },
    });

    expect(printed[0]).toMatch(/^E2E FAILED: 1 of 2 flows failed/);
    expect(written["e2e-report/failed.txt"]).toBe(
      "e2e/flows/auth/login.yaml\n",
    );
    expect(exitCode).toBe(1);
  });

  it("SHOULD exit 2 WHEN Maestro wrote no report (crash, or no flow matched the tags)", async () => {
    const { exitCode, printed } = await run(
      { files: { "e2e-report/junit.xml": undefined } },
      { argv: ["--tags", "nonexistent"] },
    );

    expect(printed[0]).toMatch(/^E2E NOT RUN: maestro produced no report/);
    expect(exitCode).toBe(2);
  });

  it("SHOULD exit 2 AND never print PASSED WHEN the report has zero flows", async () => {
    const { exitCode, printed } = await run({
      files: { "e2e-report/junit.xml": junit([]) },
    });

    expect(printed[0]).toMatch(/^E2E NOT RUN: no flows matched/);
    expect(exitCode).toBe(2);
  });

  it("SHOULD exit 2 WHEN the report is malformed", async () => {
    const { exitCode, printed } = await run({
      files: { "e2e-report/junit.xml": "<html>" },
    });

    expect(printed[0]).toMatch(
      /^E2E NOT RUN: could not read the Maestro report/,
    );
    expect(exitCode).toBe(2);
  });

  it("SHOULD not exceed the summary limits WHEN many flows failed", async () => {
    const xml = junit(manyFlows(100, 20));
    const { printed } = await run({ files: { "e2e-report/junit.xml": xml } });

    expect(printed[0]).toContain("+5 more failed flows");
  });
});

describe("runE2e --failed", () => {
  it("SHOULD stop WHEN there is no failed.txt", async () => {
    const { exitCode, printed } = await run({}, { argv: ["--failed"] });

    expect(printed).toEqual([
      "E2E NOT RUN: no failed flows from the previous run",
    ]);
    expect(exitCode).toBe(2);
  });

  it("SHOULD run only the listed flows, one Maestro call per file", async () => {
    const files = {
      "e2e-report/failed.txt":
        "e2e/flows/auth/login.yaml\ne2e/flows/auth/signup.yaml\n",
    };
    const { deps } = await run({ files }, { argv: ["--failed"] });

    expect(deps.exec).toHaveBeenCalledTimes(2);
    expect(deps.exec.mock.calls[0][0].args[1]).toBe(
      "e2e/flows/auth/login.yaml",
    );
    expect(deps.exec.mock.calls[1][0].args[1]).toBe(
      "e2e/flows/auth/signup.yaml",
    );
  });
});

describe("runE2e --headless", () => {
  it("SHOULD pass --headless to Maestro only WHEN the flag is given", async () => {
    const headed = await run({});
    const headless = await run({}, { argv: ["--headless"] });

    expect(headed.deps.exec.mock.calls[0][0].args).not.toContain("--headless");
    expect(headless.deps.exec.mock.calls[0][0].args).toContain("--headless");
  });
});

describe("runE2e --list-tags", () => {
  function flow(tags) {
    return `url: x\nname: n\ntags:\n${tags.map((t) => `  - ${t}`).join("\n")}\n---\n- launchApp\n`;
  }

  it("SHOULD print each tag with its flow count and skip every precondition", async () => {
    const { deps, exitCode, printed, written } = await run(
      {
        deps: {
          exists: jest.fn(() => false),
          hasCommand: jest.fn(() => false),
          listFiles: jest.fn(() => [
            "auth/login.yaml",
            "auth/signup.yaml",
            "stock/add.yaml",
            "notes.md",
          ]),
        },
        files: {
          "e2e/flows/auth/login.yaml": flow(["auth", "spec-002", "smoke"]),
          "e2e/flows/auth/signup.yaml": flow(["auth", "spec-002"]),
          "e2e/flows/stock/add.yaml": flow(["stock", "spec-021"]),
        },
      },
      { argv: ["--list-tags"], env: {} },
    );

    expect(exitCode).toBe(0);
    expect(deps.exec).not.toHaveBeenCalled();
    expect(written).toEqual({});
    expect(printed[0]).toContain("(3 flows)");
    expect(printed[0]).toContain("auth      2 flows");
    expect(printed[0]).toContain("smoke     1 flow");
    expect(printed[0]).toContain("spec-021  1 flow");
  });

  it("SHOULD say so WHEN no flow has tags", async () => {
    const { exitCode, printed } = await run(
      { deps: { listFiles: jest.fn(() => []) } },
      { argv: ["--list-tags"] },
    );

    expect(exitCode).toBe(0);
    expect(printed).toEqual(["No tags found in e2e/flows"]);
  });
});
