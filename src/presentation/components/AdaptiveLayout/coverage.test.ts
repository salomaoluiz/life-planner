import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import {
  inlineModals,
  legacyAdaptiveAllowList,
  neverAdaptive,
} from "./allowLists";

const ROOT = process.cwd();
const SCREENS = join(ROOT, "src/presentation/screens");

export function listAdaptiveTargets(
  root: string,
  screens: string,
  extraInline: string[],
) {
  const found = new Set<string>(extraInline);

  for (const file of listFiles(join(root, "app"))) {
    for (const match of readFileSync(file, "utf8").matchAll(
      /from "@screens\/([^"]+)"/g,
    )) {
      found.add(match[1]);
    }
  }
  const modalRoutes = readFileSync(
    join(root, "src/navigation/modalRoutes.tsx"),
    "utf8",
  );

  for (const match of modalRoutes.matchAll(
    /import\(\s*"@screens\/([^"]+)"\s*\)\s*,?\s*(?:"(\w+)")?/g,
  )) {
    found.add(resolveFolder(screens, match[1], match[2]));
  }

  return [...found]
    .filter(
      (folder) => !(folder in neverAdaptive) && !folder.startsWith("Dev/"),
    )
    .sort();
}

export function missingAdaptive(
  screens: string,
  targets: string[],
  allowList: string[],
) {
  return targets
    .filter((folder) => !allowList.includes(folder))
    .filter((folder) => {
      const index = join(screens, folder, "index.tsx");
      const hasWide = existsSync(join(screens, folder, "views/Wide.tsx"));
      const usesLayout =
        existsSync(index) &&
        readFileSync(index, "utf8").includes("AdaptiveLayout");

      return !hasWide || !usesLayout;
    })
    .map(
      (folder) =>
        `${folder}: needs views/Wide.tsx and an index.tsx rendering <AdaptiveLayout> (see .claude/context/presentation.md, "Adaptive layout")`,
    );
}

function indexSource(screens: string, folder: string) {
  const file = ["index.ts", "index.tsx"]
    .map((name) => join(screens, folder, name))
    .find((path) => existsSync(path));

  return file ? readFileSync(file, "utf8") : "";
}

function listFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory()
      ? listFiles(join(dir, entry.name))
      : [join(dir, entry.name)],
  );
}

// `@screens/X` + key `K` resolves to X/<dir> when X's barrel has `default as K } from "./<dir>"`, else to X.
function resolveFolder(screens: string, folder: string, key?: string) {
  const barrel = key
    ? new RegExp(`default as ${key}\\s*\\} from "\\./([^"]+)"`).exec(
        indexSource(screens, folder),
      )
    : null;

  return barrel ? `${folder}/${barrel[1]}` : folder;
}

describe("adaptive layout coverage (spec 099)", () => {
  const targets = listAdaptiveTargets(ROOT, SCREENS, inlineModals);

  it("SHOULD have every routed screen and modal on the adaptive layout or in the legacy allow-list", () => {
    expect(missingAdaptive(SCREENS, targets, legacyAdaptiveAllowList)).toEqual(
      [],
    );
  });

  it("SHOULD list in the allow-list only folders that exist and are still targets", () => {
    const stale = legacyAdaptiveAllowList.filter(
      (folder) =>
        !targets.includes(folder) ||
        !existsSync(join(SCREENS, folder, "index.tsx")),
    );

    expect(stale).toEqual([]);
  });

  it("SHOULD drop an allow-list entry once its folder is migrated", () => {
    const migrated = legacyAdaptiveAllowList.filter(
      (folder) =>
        existsSync(join(SCREENS, folder, "views/Wide.tsx")) &&
        readFileSync(join(SCREENS, folder, "index.tsx"), "utf8").includes(
          "AdaptiveLayout",
        ),
    );

    expect(migrated).toEqual([]);
  });

  it("SHOULD fail for a new screen without views/Wide.tsx", () => {
    const tmp = mkdtempSync(join(tmpdir(), "adaptive-"));

    mkdirSync(join(tmp, "New/views"), { recursive: true });
    writeFileSync(join(tmp, "New/index.tsx"), "export default function A() {}");

    expect(missingAdaptive(tmp, ["New"], [])).toHaveLength(1);

    writeFileSync(join(tmp, "New/views/Wide.tsx"), "export default 1;");
    writeFileSync(
      join(tmp, "New/index.tsx"),
      "<AdaptiveLayout vm={vm} wide={Wide} />",
    );
    expect(missingAdaptive(tmp, ["New"], [])).toEqual([]);
  });

  it("SHOULD document why each excluded folder is excluded", () => {
    expect(Object.values(neverAdaptive).every(Boolean)).toBe(true);
  });
});
