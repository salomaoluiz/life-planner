import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const IGNORED = /(^|\/)(_layout\.tsx|\+not-found\.tsx|\(dev\))(\/|$)/;
// The catch-all route is covered through the modal names it serves.
const CATCH_ALL = /\[\.\.\.modal\]\.tsx$/;

// The names registered in MODAL_ROUTES (`name: Component,` or `name: lazyModal(` lines).
function listModals(root = process.cwd()): string[] {
  const source = readFileSync(
    join(root, "src/navigation/modalRoutes.tsx"),
    "utf8",
  );
  const body = source.slice(source.indexOf("MODAL_ROUTES"));

  return [...body.matchAll(/^\s+([a-z_]+): (?:\w+,|lazyModal\()/gm)].map(
    (match) => match[1],
  );
}

// Route files under `app/` (posix paths relative to the repo root) that stand for a screen of their own.
function listRoutes(root = process.cwd()): string[] {
  return walk(join(root, "app"))
    .map((file) => relative(root, file).split("\\").join("/"))
    .filter((file) => file.endsWith(".tsx"))
    .filter((file) => !IGNORED.test(file) && !CATCH_ALL.test(file))
    .sort();
}

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)],
  );
}

export { listModals, listRoutes };
