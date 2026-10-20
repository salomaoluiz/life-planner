import { selectImpact } from "./impact.mjs";
import { flowNameFromFile } from "./progress.mjs";
import { buildSummary, parseJUnit } from "./summarize.mjs";
import { buildTagList, parseFlowTags } from "./tags.mjs";
import {
  parseDurations,
  resolveWorkers,
  RETRY_WORKERS,
  splitFlows,
} from "./workers.mjs";

const DURATIONS_FILE = "e2e/.durations.json";
const MAX_REASONS = 10;
const REPORT_DIR = "e2e-report";
const DEFAULT_API_URL = "http://localhost:3000/api";
const DEFAULT_WEB_URL = "http://localhost:8081";

export function buildMaestroArgs({
  apiUrl,
  artifactsDir = `${REPORT_DIR}/artifacts`,
  failedOnly,
  headless,
  junitPath,
  tags,
  target,
  webUrl,
}) {
  const args = [
    "test",
    ...[target].flat(),
    "--platform",
    "web",
    "--format",
    "junit",
    "--output",
    junitPath,
    "--test-output-dir",
    artifactsDir,
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
    changed: false,
    dryRun: false,
    failedOnly: false,
    fileList: false,
    headless: false,
    listTags: false,
    tags: [],
    unchanged: false,
  };
  for (let index = 0; index < argv.length; index += 1) {
    if (argv[index] === "--failed") {
      options.failedOnly = true;
    } else if (argv[index] === "--changed") {
      options.changed = true;
    } else if (argv[index] === "--unchanged") {
      options.unchanged = true;
    } else if (argv[index] === "--dry-run") {
      options.dryRun = true;
    } else if (argv[index] === "--workers") {
      options.workers = argv[index + 1];
      index += 1;
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

  // --changed picks the flows from the files changed in both repos; an explicit --tags wins.
  let partialLabel;
  let extraFlowFiles = [];
  let unchangedFiles;
  const selectsByImpact = options.changed || options.unchanged;
  if (selectsByImpact && options.tags.length === 0 && !options.failedOnly) {
    const backendDir = nonEmpty(env.E2E_BACKEND_DIR, "../life-planner-back");
    if (!deps.exists(backendDir)) {
      return notRun(`${backendDir} not found`);
    }
    const impact = selectImpact({
      back: deps.changedFiles(backendDir),
      front: deps.changedFiles("."),
    });
    if (impact.skip) {
      return finish("E2E SKIPPED: docs-only change", 0);
    }
    if (options.unchanged) {
      // The complement of --changed: the flows it did not select, so a green --changed is never run twice.
      if (impact.tags === "all") {
        return finish(
          "E2E SKIPPED: --changed already selected the full suite",
          0,
        );
      }
      const covered = new Set([
        ...impact.flowFiles.map((file) => flowNameFromFile(file)),
        ...plannedFlows({ ...options, tags: impact.tags }, [], deps),
      ]);
      unchangedFiles = plannedFlows({ ...options, tags: [] }, [], deps)
        .filter((name) => !covered.has(name))
        .map((name) => `e2e/flows/${name}.yaml`);
      options.fileList = true;
      partialLabel = `unchanged: not covered by changed (${impact.tags.join(", ")})`;
      if (unchangedFiles.length === 0) {
        return finish("E2E SKIPPED: --changed already covered every flow", 0);
      }
    } else if (impact.tags !== "all") {
      options.tags = impact.tags;
      extraFlowFiles = impact.flowFiles;
      partialLabel = `changed: ${impact.tags.join(", ")}`;
    }
    if (options.dryRun) {
      let selection = `tags ${impact.tags.join(", ")}`;
      if (impact.tags === "all") {
        selection = "full suite";
      }
      if (options.unchanged) {
        selection = `the flows --changed does not select (${selection})`;
      }
      const count = options.unchanged
        ? unchangedFiles.length
        : plannedFlows(options, ["e2e/flows"], deps).length;
      return finish(
        [
          `E2E DRY RUN: ${selection}, ${count} flows`,
          ...impact.reasons.slice(0, MAX_REASONS),
          ...(impact.reasons.length > MAX_REASONS
            ? [`+${impact.reasons.length - MAX_REASONS} more changed files`]
            : []),
        ].join("\n"),
        0,
      );
    }
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
  if (unchangedFiles) {
    targets = unchangedFiles;
  } else if (options.failedOnly) {
    targets = readFailedTargets(deps);
    if (targets.length === 0) {
      return notRun("no failed flows from the previous run");
    }
  }

  deps.removeReportFiles();
  const tagged = plannedFlows(options, targets, deps);
  // A changed flow already selected by the tags does not run twice.
  const extraFiles = extraFlowFiles.filter(
    (file) => !tagged.includes(flowNameFromFile(file)),
  );
  const expected = [
    ...tagged,
    ...extraFiles.map((file) => flowNameFromFile(file)),
  ];
  const started = deps.now();
  const workerCount = resolveWorkers({ env, option: options.workers });
  const allFiles =
    options.fileList || options.failedOnly
      ? targets
      : [...tagged, ...extraFiles.map(flowNameFromFile)].map(
          (name) => `e2e/flows/${name}.yaml`,
        );
  const parallel = workerCount > 1 && allFiles.length > 1;
  const runs = parallel
    ? splitFlows(allFiles, readDurations(deps), workerCount).map(
        (files, index) => ({
          artifactsDir: `${REPORT_DIR}/artifacts/w${index}`,
          junitPath: `${REPORT_DIR}/junit-w${index}.xml`,
          logFile: `${REPORT_DIR}/maestro-w${index}.log`,
          tags: options.tags.includes("wip") ? ["wip"] : [],
          target: files,
        }),
      )
    : [
        ...(unchangedFiles
          ? [{ tags: [], target: unchangedFiles }]
          : targets.map((target) => ({ tags: options.tags, target }))),
        ...extraFiles.map((target) => ({ tags: [], target })),
      ].map((run, index, list) => ({
        ...run,
        artifactsDir: `${REPORT_DIR}/artifacts`,
        junitPath:
          list.length === 1
            ? `${REPORT_DIR}/junit.xml`
            : `${REPORT_DIR}/junit-${index}.xml`,
        logFile: `${REPORT_DIR}/maestro.log`,
      }));
  function execRun(run) {
    // All Maestro output goes to the log file, never to the terminal: this is the token saving.
    return deps.exec({
      args: buildMaestroArgs({
        apiUrl,
        artifactsDir: run.artifactsDir,
        failedOnly: options.failedOnly || options.fileList || parallel,
        headless: options.headless,
        junitPath: run.junitPath,
        tags: run.tags,
        target: run.target,
        webUrl,
      }),
      command: "maestro",
      logFile: run.logFile,
    });
  }

  async function execAll(batch, names) {
    const stopProgress =
      deps.startProgress?.({
        artifactRoots: [...new Set(batch.map((run) => run.artifactsDir))],
        expected: names,
        logFiles: [...new Set(batch.map((run) => run.logFile))],
        started,
      }) ?? (() => {});
    try {
      if (parallel) {
        await Promise.all(batch.map(execRun));
      } else {
        for (const run of batch) {
          await execRun(run);
        }
      }
    } finally {
      stopProgress();
    }
  }

  await execAll(runs, expected);

  function readReports(batch) {
    return batch
      .map((run) => deps.readFile(run.junitPath))
      .filter((xml) => xml !== null);
  }
  const reports = readReports(runs);
  if (parallel && reports.length < runs.length) {
    return notRun(
      "a worker produced no report, see e2e-report/maestro-w*.log (try --workers 1)",
    );
  }
  if (reports.length === 0) {
    return notRun(
      "maestro produced no report (wrong --tags?), see e2e-report/maestro.log",
    );
  }

  // Later reports win: a flow re-run in the retry pass replaces its first result.
  const flowsByName = new Map();
  try {
    for (const xml of reports) {
      parseJUnit(xml).flows.forEach((flow) => flowsByName.set(flow.name, flow));
    }
  } catch (error) {
    return notRun(
      `could not read the Maestro report (${error.message}), see e2e-report/maestro.log`,
    );
  }

  // More workers means more load on the Mac and the dev servers: failed flows get one more try at fewer workers.
  let retriedPassed = 0;
  const failedFirst = [...flowsByName.values()]
    .filter((flow) => flow.failed)
    .map((flow) => flow.name);
  if (parallel && workerCount > RETRY_WORKERS && failedFirst.length > 0) {
    const retryRuns = splitFlows(
      failedFirst.map((name) => `e2e/flows/${name}.yaml`),
      readDurations(deps),
      RETRY_WORKERS,
    ).map((files, index) => ({
      artifactsDir: `${REPORT_DIR}/artifacts/x${index}`,
      junitPath: `${REPORT_DIR}/junit-x${index}.xml`,
      logFile: `${REPORT_DIR}/maestro-x${index}.log`,
      tags: options.tags.includes("wip") ? ["wip"] : [],
      target: files,
    }));
    await execAll(retryRuns, failedFirst);
    const retryReports = readReports(retryRuns);
    reports.push(...retryReports);
    try {
      for (const xml of retryReports) {
        parseJUnit(xml).flows.forEach((flow) =>
          flowsByName.set(flow.name, flow),
        );
      }
    } catch {
      // An unreadable retry report keeps the first-pass failures.
    }
    retriedPassed = failedFirst.filter(
      (name) => !flowsByName.get(name)?.failed,
    ).length;
  }
  const durationSeconds = (deps.now() - started) / 1000;
  const flows = [...flowsByName.values()];
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
    partialLabel,
    readFlowFile: (path) => deps.readFile(path),
    retried:
      failedFirst.length > 0 && parallel && workerCount > RETRY_WORKERS
        ? {
            passed: retriedPassed,
            total: failedFirst.length,
            workers: RETRY_WORKERS,
          }
        : undefined,
    revisions: deps.revisions(),
    workers: runs.length,
  });

  // Only the new durations are merged in; a failed flow's time is not representative.
  const failedNames = new Set(
    flows.filter((flow) => flow.failed).map((flow) => flow.name),
  );
  const measured = Object.fromEntries(
    Object.entries(
      reports.reduce((all, xml) => ({ ...all, ...parseDurations(xml) }), {}),
    ).filter(([file]) => !failedNames.has(flowNameFromFile(file))),
  );
  deps.writeFile(
    DURATIONS_FILE,
    `${JSON.stringify({ ...readDurations(deps), ...measured }, null, 2)}\n`,
  );
  deps.writeFile(
    `${REPORT_DIR}/failed.txt`,
    summary.failedFiles.map((file) => `${file}\n`).join(""),
  );
  return finish(summary.text, summary.exitCode);
}

function nonEmpty(value, fallback) {
  return typeof value === "string" && value !== "" ? value : fallback;
}

// Names of the flows this run will execute, in file order; the CLI uses them to show live progress.
function plannedFlows(options, targets, deps) {
  if (options.failedOnly || options.fileList) {
    return targets.map(flowNameFromFile);
  }
  return deps
    .listFiles("e2e/flows")
    .filter((file) => file.endsWith(".yaml"))
    .filter((file) => {
      const tags = parseFlowTags(deps.readFile(`e2e/flows/${file}`) ?? "");
      const included =
        options.tags.length === 0 ||
        options.tags.some((tag) => tags.includes(tag));
      const excluded = tags.includes("wip") && !options.tags.includes("wip");
      return included && !excluded;
    })
    .sort()
    .map((file) => flowNameFromFile(file));
}

function readDurations(deps) {
  try {
    return JSON.parse(deps.readFile(DURATIONS_FILE) ?? "{}");
  } catch {
    return {};
  }
}

function readFailedTargets(deps) {
  return (deps.readFile(`${REPORT_DIR}/failed.txt`) ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}
