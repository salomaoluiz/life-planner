const MAX_ERROR_LENGTH = 300;
const MAX_BLOCKS = 15;
const ENVIRONMENT_FAILURE_BLOCKS = 3;
const FAILED_FILE = "e2e-report/failed.txt";

export function buildSummary(input) {
  const total = input.flows.length;
  const failed = input.flows.filter((flow) => flow.failed);
  const workerText = input.workers > 1 ? `, ${input.workers} workers` : "";
  const duration = `${formatDuration(input.durationSeconds)}${workerText}`;
  const suffix = input.revisions ? ` · ${input.revisions}` : "";
  const partial = input.partialLabel ? ` (${input.partialLabel})` : "";

  if (failed.length === 0) {
    return {
      exitCode: 0,
      failedFiles: [],
      text: `E2E PASSED${partial}: ${total}/${total} flows (${duration})${suffix}`,
    };
  }

  const environment = failed.length / total > 0.5;
  const limit = environment ? ENVIRONMENT_FAILURE_BLOCKS : MAX_BLOCKS;
  const counts = `${failed.length} of ${total} flows failed (${duration})${suffix}`;
  const header = environment
    ? `LIKELY ENVIRONMENT FAILURE: ${counts}. Check the app, the API and login first; showing the first ${limit}. Re-run failures only: yarn e2e:failed`
    : `E2E FAILED${partial}: ${counts}. Re-run failures only: yarn e2e:failed`;
  const blocks = failed
    .slice(0, limit)
    .map((flow, index) => buildBlock(index + 1, flow, input));
  const parts = [header, ...blocks];

  if (failed.length > limit) {
    parts.push(
      `+${failed.length - limit} more failed flows, see ${FAILED_FILE}`,
    );
  }

  return {
    exitCode: 1,
    failedFiles: failed.map((flow) => `e2e/flows/${flow.name}.yaml`),
    text: parts.join("\n\n"),
  };
}

export function extractStep(message) {
  const match = /^(?:Step|Command):\s*(.+)$/im.exec(message);
  return match ? match[1].trim() : null;
}

// Maestro names the failure screenshot after the step: step-007-tapOnElement-<selector>.png
export function extractStepFromScreenshot(path) {
  const match = /step-(\d+)-([^/]+)\.png$/.exec(path);
  if (!match) {
    return null;
  }
  const [action, ...rest] = match[2].split("-");
  const selector = rest.join("-");
  return `${action}${selector ? ` ${selector}` : ""} (step ${Number(match[1])})`;
}

export function formatDuration(seconds) {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  return minutes > 0 ? `${minutes}m${total % 60}s` : `${total}s`;
}

export function parseJUnit(xml) {
  if (!/<testsuite[\s>]/.test(xml)) {
    throw new Error("no <testsuite> element");
  }

  const flows = [];
  for (const match of xml.matchAll(
    /<testcase\b([^>]*?)(?:\/>|>([\s\S]*?)<\/testcase>)/g,
  )) {
    const attributes = parseAttributes(match[1]);
    const body = match[2] ?? "";
    const failure = /<(failure|error)\b([^>]*?)(?:\/>|>([\s\S]*?)<\/\1>)/.exec(
      body,
    );
    const skipped = /<skipped\b/.test(body);
    const status = (attributes.status ?? "").toUpperCase();
    const failed =
      Boolean(failure) ||
      skipped ||
      ["ERROR", "FAILED", "FAILURE"].includes(status);

    flows.push({
      failed,
      message: failed
        ? firstNonEmpty(failureMessage(failure, skipped), "flow failed")
        : "",
      name: attributes.name ?? "",
    });
  }

  return { flows };
}

export function readTags(yaml) {
  const tags = [];
  let inTags = false;
  for (const line of yaml.split(/^---\s*$/m)[0].split("\n")) {
    const item = /^\s+-\s+(\S+)\s*$/.exec(line);
    if (/^tags:\s*$/.test(line)) {
      inTags = true;
    } else if (inTags && item) {
      tags.push(item[1]);
    } else {
      inTags = false;
    }
  }
  return tags;
}

function buildBlock(index, flow, input) {
  const file = `e2e/flows/${flow.name}.yaml`;
  const yaml = input.readFlowFile(file);
  const tags = yaml ? readTags(yaml) : [];
  const screenshot = pickArtifact(input.artifactFiles, flow.name, ".png");
  const step =
    extractStep(flow.message) ??
    (screenshot ? extractStepFromScreenshot(screenshot) : null);
  const log = pickArtifact(input.artifactFiles, flow.name, ".log");

  return [
    `${index}. ${flow.name}${tags.length > 0 ? `  [${tags.join(", ")}]` : ""}`,
    `   file: ${file}`,
    step ? `   step: ${step}` : null,
    `   error: ${oneLine(flow.message)}`,
    screenshot ? `   screenshot: ${screenshot}` : null,
    log ? `   log: ${log}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

function decodeEntities(text) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

function failureMessage(failure, skipped) {
  if (failure) {
    return firstNonEmpty(
      xmlText(failure[3] ?? "").trim(),
      parseAttributes(failure[2]).message,
      "flow failed",
    );
  }
  return skipped ? "flow was skipped" : "";
}

function firstNonEmpty(...values) {
  return values.find((value) => typeof value === "string" && value !== "");
}

function oneLine(message) {
  const first = message
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line !== "" && !/^(?:Step|Command):/i.test(line));
  const text = (first ?? "flow failed").replace(/\s+/g, " ");
  return text.length > MAX_ERROR_LENGTH
    ? `${text.slice(0, MAX_ERROR_LENGTH - 3)}...`
    : text;
}

function parseAttributes(text) {
  const attributes = {};
  for (const match of text.matchAll(/([\w:-]+)="([^"]*)"/g)) {
    attributes[match[1]] = decodeEntities(match[2]);
  }
  return attributes;
}

function pickArtifact(files, name, extension) {
  const sanitized = name.replaceAll("/", "_");
  const matches = files
    .filter(
      (file) => file.endsWith(extension) && file.includes(`/${sanitized}/`),
    )
    .sort();
  // The failing step is the last screenshot Maestro took.
  return matches.at(-1) ?? null;
}

function xmlText(raw) {
  return raw
    .split(/(<!\[CDATA\[[\s\S]*?\]\]>)/)
    .map((part) =>
      part.startsWith("<![CDATA[") ? part.slice(9, -3) : decodeEntities(part),
    )
    .join("");
}
