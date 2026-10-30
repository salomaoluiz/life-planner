import { spawnSync } from "node:child_process";
import { resolve } from "node:path";

const script = resolve(__dirname, "check-version.mjs");
function entry(
  version: string,
  date = "2026-10-30",
  bullets = "- Something new (spec 056).",
) {
  return `# Changelog\n\n## [${version}] - ${date}\n### Added\n${bullets}\n\n## [1.0.0] - 2026-10-01\n- Old\n`;
}

function run(overrides: Record<string, unknown>) {
  const input = {
    base: "1.0.0",
    baseChangelogDate: "2026-10-01",
    changelog: entry("1.0.1"),
    current: "1.0.1",
    shippedChanged: true,
    today: "2026-10-30",
    ...overrides,
  };
  const result = spawnSync("node", [script], {
    encoding: "utf8",
    env: { ...process.env, CHECK_VERSION_INPUT: JSON.stringify(input) },
  });
  return {
    failures: result.stdout.split("\n").filter((line) => line.includes("FAIL")),
    status: result.status,
  };
}

describe("check-version", () => {
  it("SHOULD fail WHEN shipped code changed without a bump", () => {
    const { failures, status } = run({
      changelog: entry("1.0.0"),
      current: "1.0.0",
    });
    expect(status).toBe(1);
    expect(failures[0]).toContain("bump package.json version");
  });

  it("SHOULD fail WHEN the bump is a double jump", () => {
    expect(
      run({ changelog: entry("1.2.1"), current: "1.2.1" }).failures[0],
    ).toContain("exactly one step");
  });

  it.each([
    ["1.0.1", "fix: a"],
    ["1.1.0", "feat: a"],
    ["2.0.0", "feat!: a"],
  ])('SHOULD pass WHEN %s matches "%s"', (current, prType) => {
    expect(run({ changelog: entry(current), current, prType }).status).toBe(0);
  });

  it("SHOULD fail WHEN a feat PR only bumps the patch", () => {
    expect(run({ prType: "feat: a" }).failures[0]).toContain(
      "needs a minor bump",
    );
  });

  it("SHOULD fail WHEN a fix PR bumps the minor", () => {
    expect(
      run({ changelog: entry("1.1.0"), current: "1.1.0", prType: "fix: a" })
        .failures[0],
    ).toContain("needs a patch");
  });

  it("SHOULD fail WHEN the changelog starts with another version", () => {
    expect(run({ changelog: entry("1.0.2") }).failures[0]).toContain(
      'must start with "## [1.0.1]',
    );
  });

  it("SHOULD fail WHEN the entry has no bullet", () => {
    expect(
      run({ changelog: entry("1.0.1", "2026-10-30", "") }).failures[0],
    ).toContain("at least one");
  });

  it("SHOULD fail WHEN the entry is older than main latest", () => {
    expect(
      run({ changelog: entry("1.0.1", "2026-09-01") }).failures[0],
    ).toContain("earlier than main");
  });

  it("SHOULD fail WHEN no shipped path changed but the version moved", () => {
    expect(run({ shippedChanged: false }).failures[0]).toContain(
      "must stay 1.0.0",
    );
  });

  it("SHOULD pass WHEN no shipped path changed and the version is the same", () => {
    expect(run({ current: "1.0.0", shippedChanged: false }).status).toBe(0);
  });
});
