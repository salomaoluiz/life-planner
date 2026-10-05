import fs from "fs";
import path from "path";

const root = path.resolve(__dirname, "..");
const literal = /#[0-9a-fA-F]{3,8}\b|\brgba?\(/;

function walk(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

it("SHOULD NOT hard-code colors in src/presentation (only theme/constants may)", () => {
  const offenders = walk(root)
    .filter(
      (file) =>
        !file.includes(`${path.sep}theme${path.sep}constants${path.sep}`),
    )
    .filter(
      (file) => !/\.test\.tsx?$|\.mocks\.tsx?$|\.fixture\.tsx?$/.test(file),
    )
    .filter((file) => literal.test(fs.readFileSync(file, "utf8")));

  expect(offenders).toEqual([]);
});
