import { buildSummary, parseJUnit } from "./summarize.mjs";

export const editItemYaml =
  "url: http://localhost:8081\nname: stock/edit-item\ntags:\n  - stock\n  - spec-005\n---\n- tapOn: x\n";

export function junit(cases) {
  const body = cases
    .map(({ failure, name }) =>
      failure === undefined
        ? `<testcase id="${name}" name="${name}" classname="${name}" time="1.0" status="SUCCESS"/>`
        : `<testcase id="${name}" name="${name}" classname="${name}" time="1.0" status="ERROR"><failure>${failure}</failure></testcase>`,
    )
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?><testsuites><testsuite name="Test Suite" tests="${cases.length}">${body}</testsuite></testsuites>`;
}

export function manyFlows(total, failing) {
  return Array.from({ length: total }, (_, index) => ({
    failure: index < failing ? `Element not found: id "x${index}"` : undefined,
    name: `mod/flow-${index}`,
  }));
}

export function setup({ cases, ...overrides }) {
  const files = { "e2e/flows/stock/edit-item.yaml": editItemYaml };

  return buildSummary({
    artifactFiles: [],
    durationSeconds: 192,
    flows: parseJUnit(junit(cases)).flows,
    readFlowFile: (path) => files[path] ?? null,
    revisions: "",
    ...overrides,
  });
}
