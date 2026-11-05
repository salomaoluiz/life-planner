import { brotliCompressSync, gzipSync } from "node:zlib";

// Paths whose change can move the web bundle (spec 088).
const BUNDLE_PATHS =
  /^(app\/|metro\.config\.js$|app\.config\.ts$|package\.json$|yarn\.lock$)/;

// Imports that weigh on the entry chunk: a change to a file using them selects the check.
const HEAVY_IMPORT =
  /from\s+["'](date-fns|lodash|@sentry\/[^"']*|react-native-paper[^"']*|@supabase\/[^"']*)["']/;

const KINDS = ["gzipBytes", "brotliBytes"];

function bundleSizes(buffer) {
  return {
    brotliBytes: brotliCompressSync(buffer).length,
    gzipBytes: gzipSync(buffer).length,
    rawBytes: buffer.length,
  };
}

function bundleSummary({ ok, rows }) {
  const lines = [
    "## Web bundle",
    "",
    "| Scope | Kind | Budget (KB) | Measured (KB) | Delta (KB) |",
    "| --- | --- | --- | --- | --- |",
    ...rows.map(
      (row) =>
        `| ${row.scope} | ${row.kind} | ${row.limit === undefined ? "-" : kb(row.limit)} | ${kb(row.value)} | ${row.delta === null ? "-" : kb(row.delta)} |`,
    ),
    "",
    ok ? "BUNDLE PASSED" : "BUNDLE FAILED: over budget",
  ];

  return `${lines.join("\n")}\n`;
}

function compareBundle(measured, budget) {
  const rows = [];

  for (const scope of ["entry", "total"]) {
    for (const kind of KINDS) {
      const limit = budget?.[scope]?.[kind];
      const value = measured[scope][kind];

      rows.push({
        delta: limit === undefined ? null : value - limit,
        kind,
        limit,
        ok: limit === undefined || value <= limit,
        scope,
        value,
      });
    }
  }

  return { ok: rows.every((row) => row.ok), rows };
}

function kb(bytes) {
  return (bytes / 1024).toFixed(1);
}

function selectsBundle(files, readFile) {
  return files.some((file) => {
    if (BUNDLE_PATHS.test(file)) {
      return true;
    }
    if (!file.startsWith("src/") || !/\.(ts|tsx)$/.test(file)) {
      return false;
    }
    try {
      return HEAVY_IMPORT.test(readFile(file));
    } catch {
      return false;
    }
  });
}

export { bundleSizes, bundleSummary, compareBundle, selectsBundle };
