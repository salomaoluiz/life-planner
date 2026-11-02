import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { mergeBaseline } from "./baseline.mjs";

const dir = "perf-report/measured";
const measured = Object.fromEntries(
  readdirSync(dir).map((name) => {
    const { key, measured: report } = JSON.parse(
      readFileSync(join(dir, name), "utf8"),
    );

    return [key, report];
  }),
);

mergeBaseline(measured, "perf/budgets");
