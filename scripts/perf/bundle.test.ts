import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

import {
  bundleSizes,
  bundleSummary,
  compareBundle,
  selectsBundle,
} from "./bundle.mjs";

function sizes(gzipBytes: number, brotliBytes: number) {
  return { brotliBytes, gzipBytes, rawBytes: 0 };
}

const budget = {
  entry: { brotliBytes: 100, gzipBytes: 120 },
  total: { brotliBytes: 100, gzipBytes: 120 },
};

describe("compareBundle", () => {
  it("SHOULD pass WHEN every size is within the budget", () => {
    const result = compareBundle(
      { entry: sizes(120, 90), total: sizes(100, 100) },
      budget,
    );

    expect(result.ok).toBe(true);
  });

  it("SHOULD fail WHEN a size is over the budget", () => {
    const result = compareBundle(
      { entry: sizes(121, 90), total: sizes(100, 100) },
      budget,
    );

    expect(result.ok).toBe(false);
    expect(result.rows.find((row) => !row.ok)).toMatchObject({
      delta: 1,
      kind: "gzipBytes",
      scope: "entry",
    });
  });

  it("SHOULD print the table and the verdict", () => {
    const text = bundleSummary(
      compareBundle({ entry: sizes(121, 90), total: sizes(1, 1) }, budget),
    );

    expect(text).toContain("| entry | gzipBytes |");
    expect(text).toContain("BUNDLE FAILED");
  });
});

describe("bundleSizes", () => {
  it("SHOULD compress a repetitive buffer below its raw size", () => {
    const result = bundleSizes(Buffer.from("a".repeat(5000)));

    expect(result.rawBytes).toBe(5000);
    expect(result.gzipBytes).toBeLessThan(100);
    expect(result.brotliBytes).toBeLessThan(100);
  });
});

describe("selectsBundle", () => {
  function read(content: string) {
    return () => content;
  }

  it("SHOULD select WHEN package.json or yarn.lock changed", () => {
    expect(selectsBundle(["package.json"], read(""))).toBe(true);
    expect(selectsBundle(["yarn.lock"], read(""))).toBe(true);
  });

  it("SHOULD select WHEN app/, metro or app config changed", () => {
    expect(selectsBundle(["app/login.tsx"], read(""))).toBe(true);
    expect(selectsBundle(["metro.config.js"], read(""))).toBe(true);
    expect(selectsBundle(["app.config.ts"], read(""))).toBe(true);
  });

  it("SHOULD select WHEN a src file imports a heavy module", () => {
    expect(
      selectsBundle(["src/a.ts"], read('import { format } from "date-fns";')),
    ).toBe(true);
  });

  it("SHOULD NOT select WHEN docs or light src files changed", () => {
    expect(selectsBundle(["docs/x.md"], read(""))).toBe(false);
    expect(
      selectsBundle(["src/a.ts"], read('import { x } from "@domain/x";')),
    ).toBe(false);
  });
});

describe("bundle lint rules", () => {
  // ESLint cannot run inside the jest-expo transform, so it runs as a child process.
  function lint(code: string) {
    const dir = mkdtempSync(join(tmpdir(), "lp-lint-"));
    const config = join(dir, "eslint.config.mjs");

    writeFileSync(
      config,
      `import rules from ${JSON.stringify(resolve("eslint/rules/no-restricted-imports.mjs"))};\nexport default rules;\n`,
    );
    const run = spawnSync(
      resolve("node_modules/.bin/eslint"),
      [
        "--config",
        config,
        "--stdin",
        "--stdin-filename",
        "src/sample.ts",
        "--format",
        "json",
      ],
      { cwd: dir, encoding: "utf8", input: code },
    );
    const [result] = JSON.parse(run.stdout) as {
      messages: { message: string }[];
    }[];

    return result.messages.map((message) => message.message);
  }

  it("SHOULD reject a namespace import of date-fns", () => {
    const messages = lint('import * as dateFns from "date-fns";\n');

    expect(messages.join()).toContain("named imports");
  });

  it("SHOULD accept named imports of date-fns", () => {
    expect(lint('import { format } from "date-fns";\n')).toEqual([]);
  });

  it("SHOULD reject the lodash root import", () => {
    const messages = lint('import { debounce } from "lodash";\n');

    expect(messages.join()).toContain("lodash/<name>");
  });
});
