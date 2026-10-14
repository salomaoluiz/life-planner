const FLOWS_DIR = "e2e/flows";

export function buildTagList(files, readFile) {
  const counts = new Map();
  let flowCount = 0;
  for (const file of files.filter((entry) => entry.endsWith(".yaml"))) {
    const tags = parseFlowTags(readFile(`${FLOWS_DIR}/${file}`) ?? "");
    flowCount += 1;
    for (const tag of tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  if (counts.size === 0) {
    return "No tags found in e2e/flows";
  }
  const width = Math.max(...[...counts.keys()].map((tag) => tag.length));
  const lines = [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([tag, count]) =>
        `  ${tag.padEnd(width)}  ${count} flow${count === 1 ? "" : "s"}`,
    );

  return [
    `Tags in e2e/flows (${flowCount} flows). Use: yarn e2e --tags <tag>[,<tag>]`,
    ...lines,
  ].join("\n");
}

// Reads the `tags:` list of a flow header (the part before the first `---`).
export function parseFlowTags(yaml) {
  const header = yaml.split(/^---\s*$/m)[0];
  const tags = [];
  let inTags = false;
  for (const line of header.split("\n")) {
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
    } else if (inTags) {
      const match = line.match(/^\s+-\s+(\S+)\s*$/);
      if (!match) {
        break;
      }
      tags.push(match[1]);
    }
  }
  return tags;
}
