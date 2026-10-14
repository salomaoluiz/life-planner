import { buildSummary, parseJUnit } from "./summarize.mjs";
import { buildTagList } from "./tags.mjs";

const REPORT_DIR = "e2e-report";
const DEFAULT_API_URL = "http://localhost:3000/api";
const DEFAULT_WEB_URL = "http://localhost:8081";

export function buildMaestroArgs({
  apiUrl,
  failedOnly,
  headless,
  junitPath,
  tags,
  target,
  webUrl,
}) {
  const args = [
    "test",
    target,
    "--platform",
    "web",
    "--format",
    "junit",
    "--output",
    junitPath,
    "--test-output-dir",
    `${REPORT_DIR}/artifacts`,
    "-e",
    `E2E_API_URL=${apiUrl}`,
    "-e",
    `E2E_WEB_URL=${webUrl}`,
  ];

  if (headless) {
    args.push("--headless");
  }

  if (target === "e2e/flows") {
    args.push("--config", "e2e/config.yaml");
  }

  if (!failedOnly) {
    if (tags.length > 0) {
      args.push("--include-tags", tags.join(","));
    }
    if (!tags.includes("wip")) {
      args.push("--exclude-tags", "wip");
    }
  }

  return args;
}

export function parseArgs(argv) {
  const options = {
    failedOnly: false,
    headless: false,
    listTags: false,
    tags: [],
  };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--failed") {
      options.failedOnly = true;
    } else if (argv[index] === "--list-tags") {
      options.listTags = true;
    } else if (argv[index] === "--headless") {
      options.headless = true;
    } else if (argv[index] === "--tags") {
      options.tags = (argv[index + 1] ?? "").split(",").filter(Boolean);
      index += 1;
    }
  }
  return options;
}

export async function runE2e({ argv, env }, deps) {
  const options = parseArgs(argv);

  // Read-only: needs no Maestro, API or app, and leaves the last run's report alone.
  if (options.listTags) {
    deps.print(
      buildTagList(deps.listFiles("e2e/flows"), (path) => deps.readFile(path)),
    );
    return 0;
  }

  const apiUrl = nonEmpty(env.E2E_API_URL, DEFAULT_API_URL).replace(/\/+$/, "");
  const webUrl = nonEmpty(env.E2E_WEB_URL, DEFAULT_WEB_URL);

  function finish(text, exitCode) {
    deps.mkdir(REPORT_DIR);
    deps.writeFile(`${REPORT_DIR}/summary.md`, `${text}\n`);
    deps.print(text);
    return exitCode;
  }

  function notRun(reason) {
    return finish(`E2E NOT RUN: ${reason}`, 2);
  }

  if (env.E2E_ENABLED !== "true") {
    return notRun("E2E runs only on the owner's Mac");
  }
  if (!deps.exists("../life-planner-back")) {
    return notRun("../life-planner-back not found");
  }
  if (!deps.hasCommand("maestro")) {
    return notRun("maestro is not installed, see e2e/README.md");
  }
  // Any HTTP answer proves the server is up: the health check pings an external host and returns 503 when offline.
  if ((await deps.fetchStatus(`${apiUrl}/health`)) === null) {
    return notRun(
      `API not reachable at ${apiUrl}, start it with yarn start:dev`,
    );
  }
  if ((await deps.fetchStatus(webUrl)) === null) {
    return notRun(`app not reachable at ${webUrl}, start it with yarn web`);
  }

  let targets = ["e2e/flows"];
  if (options.failedOnly) {
    targets = readFailedTargets(deps);
    if (targets.length === 0) {
      return notRun("no failed flows from the previous run");
    }
  }

  deps.removeReportFiles();
  const started = deps.now();
  const junitPaths = targets.map((target, index) => {
    const junitPath =
      targets.length === 1
        ? `${REPORT_DIR}/junit.xml`
        : `${REPORT_DIR}/junit-${index}.xml`;
    // All Maestro output goes to the log file, never to the terminal: this is the token saving.
    deps.exec({
      args: buildMaestroArgs({
        apiUrl,
        failedOnly: options.failedOnly,
        headless: options.headless,
        junitPath,
        tags: options.tags,
        target,
        webUrl,
      }),
      command: "maestro",
      logFile: `${REPORT_DIR}/maestro.log`,
    });
    return junitPath;
  });
  const durationSeconds = (deps.now() - started) / 1000;

  const reports = junitPaths
    .map((path) => deps.readFile(path))
    .filter((xml) => xml !== null);
  if (reports.length === 0) {
    return notRun(
      "maestro produced no report (wrong --tags?), see e2e-report/maestro.log",
    );
  }

  let flows;
  try {
    ({ flows } = parseJUnit(reports.join("\n")));
  } catch (error) {
    return notRun(
      `could not read the Maestro report (${error.message}), see e2e-report/maestro.log`,
    );
  }
  if (flows.length === 0) {
    const tagText =
      options.tags.length > 0 ? ` the tags ${options.tags.join(",")}` : "";
    return notRun(`no flows matched${tagText}`);
  }

  const summary = buildSummary({
    artifactFiles: deps
      .listFiles(`${REPORT_DIR}/artifacts`)
      .map((file) => `${REPORT_DIR}/artifacts/${file}`),
    durationSeconds,
    flows,
    readFlowFile: (path) => deps.readFile(path),
    revisions: deps.revisions(),
  });

  deps.writeFile(
    `${REPORT_DIR}/failed.txt`,
    summary.failedFiles.map((file) => `${file}\n`).join(""),
  );
  return finish(summary.text, summary.exitCode);
}

function nonEmpty(value, fallback) {
  return typeof value === "string" && value !== "" ? value : fallback;
}

function readFailedTargets(deps) {
  return (deps.readFile(`${REPORT_DIR}/failed.txt`) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
