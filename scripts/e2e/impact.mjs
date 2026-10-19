// Maps the files changed in both repos to the flow tags they can break (spec 036).
// Ordered rules, first match per file wins. A path no rule knows runs the full suite.
const ALL = "all";
const IGNORE = "ignore";

const DOCS = [/^docs\//, /^\.claude\//, /\.md$/];

const FRONT_RULES = [
  [/^e2e\/flows\/.+\.yaml$/, "flow"],
  [DOCS, IGNORE],
  [/^(e2e\/(subflows|scripts)\/|package\.json$|yarn\.lock$)/, ALL],
  [/(^|\/)(auth|login|signup)(\/|$)/i, ["auth", "account"]],
  [/^src\/presentation\/screens\/Config(\/|$)/, ["account"]],
  [/(^|\/)financial(\/|$)/i, ["financial"]],
  [/(^|\/)stock(\/|$)/i, ["stock"]],
  [/(^|\/)(family|familyMember|invite)(\/|$)/i, ["family"]],
];

const BACK_RULES = [
  [DOCS, IGNORE],
  [/^src\/(modules|api)\/finance(\/|$)/, ["financial"]],
  [/^src\/(modules|api)\/stock(\/|$)/, ["stock"]],
  [/^src\/(modules|api)\/(family|family-member)(\/|$)/, ["family"]],
];

export function selectImpact({ back, front }) {
  const tags = new Set();
  const flowFiles = [];
  const reasons = [];
  let all = false;
  let relevant = 0;

  const entries = [
    ...front.map((path) => ({ path, repo: "app", rules: FRONT_RULES })),
    ...back.map((path) => ({ path, repo: "api", rules: BACK_RULES })),
  ];
  for (const { path, repo, rules } of entries) {
    const outcome = classify(rules, path);
    if (outcome === IGNORE) {
      continue;
    }
    relevant += 1;
    if (outcome === ALL) {
      all = true;
      reasons.push(`${repo}:${path} -> full suite`);
    } else if (outcome === "flow") {
      flowFiles.push(path);
      reasons.push(`${repo}:${path} -> the flow itself`);
    } else {
      outcome.forEach((tag) => tags.add(tag));
      reasons.push(`${repo}:${path} -> ${outcome.join(", ")}`);
    }
  }

  if (relevant === 0) {
    return { flowFiles: [], reasons: [], skip: true, tags: [] };
  }
  if (all) {
    return { flowFiles: [], reasons, skip: false, tags: ALL };
  }
  tags.add("smoke");
  return { flowFiles, reasons, skip: false, tags: [...tags].sort() };
}

function classify(rules, path) {
  const rule = rules.find(([patterns]) => matches(patterns, path));
  return rule ? rule[1] : ALL;
}

function matches(patterns, path) {
  return (Array.isArray(patterns) ? patterns : [patterns]).some((pattern) =>
    pattern.test(path),
  );
}
