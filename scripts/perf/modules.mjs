const PERF_MODULES = [
  "financial",
  "stock",
  "family",
  "familyMember",
  "home",
  "auth",
  "configs",
];

// Paths whose change can move the numbers of every screen.
const SHARED =
  /^(src\/infrastructure\/|src\/application\/providers\/|src\/presentation\/components\/|app\/_layout\.tsx$|package\.json$|yarn\.lock$)/;

// A path segment (lower case, no extension) -> module.
const SEGMENT_TO_MODULE = {
  auth: "auth",
  config: "configs",
  configs: "configs",
  family: "family",
  familymember: "familyMember",
  feedback: "home",
  financial: "financial",
  home: "home",
  invite: "auth",
  login: "auth",
  quickadd: "home",
  signup: "auth",
  stock: "stock",
};

// Folders of `src/presentation/screens` whose `__perf__` tests belong to each module.
const MODULE_SCREENS = {
  auth: "(Login|Signup|Invite)",
  configs: "Config",
  family: "Family",
  familyMember: "Family",
  financial: "Financial",
  home: "(Home|QuickAdd|Feedback)",
  stock: "Stock",
};

const COVERAGE_TEST = "scripts/perf/coverage.test.ts";

function moduleForPath(file) {
  if (SHARED.test(file)) {
    return "all";
  }
  if (!file.startsWith("src/") && !file.startsWith("app/")) {
    return null;
  }
  for (const segment of file.split("/")) {
    const name = segment.replace(/\.[a-z]+$/, "").toLowerCase();
    const exact = SEGMENT_TO_MODULE[name];

    if (exact) {
      return exact;
    }
    if (file.startsWith("app/")) {
      const prefix = Object.keys(SEGMENT_TO_MODULE).find((key) =>
        name.startsWith(key),
      );

      if (prefix) {
        return SEGMENT_TO_MODULE[prefix];
      }
    }
  }

  return null;
}

function selectModules(files) {
  const selected = new Set();

  for (const file of files) {
    const mapped = moduleForPath(file);

    if (mapped === "all") {
      return [...PERF_MODULES];
    }
    if (mapped) {
      selected.add(mapped);
    }
  }

  return PERF_MODULES.filter((name) => selected.has(name));
}

// Jest path patterns: the `__perf__` folders of the modules' screens, plus the coverage test.
function testPathsFor(modules) {
  const folders = [
    ...new Set(modules.map((name) => MODULE_SCREENS[name]).filter(Boolean)),
  ];

  return [
    ...folders.map(
      (folder) => `src/presentation/screens/${folder}/.*__perf__/`,
    ),
    COVERAGE_TEST,
  ];
}

export { moduleForPath, PERF_MODULES, selectModules, testPathsFor };
