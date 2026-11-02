import { PERF_MODULES, selectModules } from "./modules.mjs";

const USAGE =
  "usage: yarn perf --changed | --all | --module <name>[,<name>] [--dry-run] [--update-baseline]";

function parseArgs(argv) {
  const args = {
    dryRun: false,
    mode: null,
    modules: [],
    updateBaseline: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--changed" || arg === "--all") {
      args.mode = arg.slice(2);
    } else if (arg === "--module") {
      args.mode = "module";
      args.modules = (argv[(index += 1)] ?? "").split(",").filter(Boolean);
    } else if (arg === "--dry-run") {
      args.dryRun = true;
    } else if (arg === "--update-baseline") {
      args.updateBaseline = true;
    } else {
      return { error: `unknown argument ${arg}. ${USAGE}` };
    }
  }
  if (!args.mode) {
    return { error: USAGE };
  }
  const unknown = args.modules.filter((name) => !PERF_MODULES.includes(name));

  if (
    unknown.length > 0 ||
    (args.mode === "module" && args.modules.length === 0)
  ) {
    return {
      error: `unknown module ${unknown.join(",") || "(none)"}. Modules: ${PERF_MODULES.join(", ")}. ${USAGE}`,
    };
  }

  return { args };
}

function selection(args, changedFiles) {
  if (args.mode === "all") {
    return [...PERF_MODULES];
  }
  if (args.mode === "module") {
    return PERF_MODULES.filter((name) => args.modules.includes(name));
  }

  return selectModules(changedFiles());
}

function summaryText({ failures, modules, passed, total }) {
  const lines = [
    "# Perf budgets",
    "",
    `Modules: ${modules.length > 0 ? modules.join(", ") : "none"}`,
    "",
    ...failures.map((failure) => `- FAILED ${failure}`),
    failures.length > 0 ? "" : null,
    failures.length === 0
      ? `PERF PASSED: ${passed}/${total}`
      : `PERF FAILED: ${passed}/${total}`,
  ];

  return `${lines.filter((line) => line !== null).join("\n")}\n`;
}

export { parseArgs, selection, summaryText, USAGE };
