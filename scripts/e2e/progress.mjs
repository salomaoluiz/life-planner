// Live progress for a human run of the suite. Maestro prints "[Passed] <flow> (<duration>)" /
// "[Failed] <flow> (<duration>)" to its log when a flow ends, and creates e2e-report/artifacts/<run>/<flow with / as _>/
// when a flow starts, so those two sources tell what passed, what runs and what is still pending.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[A-Za-z]`, "g");
const RESULT_LINE = /^\[(Passed|Failed)\]\s+(.+?)\s+\(([^)]*)\)\s*$/;

export function findRunning(expected, finished, artifactDirNames) {
  const started = new Set(artifactDirNames);
  return expected.filter(
    (name) => !finished.has(name) && started.has(name.replaceAll("/", "_")),
  );
}

export function flowNameFromFile(file) {
  return file.replace(/^e2e\/flows\//, "").replace(/\.yaml$/, "");
}

export function formatElapsed(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  return minutes > 0
    ? `${minutes}m${String(total % 60).padStart(2, "0")}s`
    : `${total}s`;
}

export function parseFinished(logText) {
  const finished = new Map();
  for (const line of logText.replace(ANSI, "").split(/[\r\n]+/)) {
    const match = line.trim().match(RESULT_LINE);
    if (match) {
      finished.set(match[2], {
        duration: match[3],
        passed: match[1] === "Passed",
      });
    }
  }
  return finished;
}

export function renderProgress({
  elapsedSeconds,
  expected,
  finished,
  running,
}) {
  const names = [...new Set([...expected, ...finished.keys()])];
  const failed = names.filter((name) => finished.get(name)?.passed === false);
  const done = names.filter((name) => finished.has(name));
  const active = names.filter(
    (name) => running.includes(name) && !finished.has(name),
  );
  const pending = names.length - done.length - active.length;

  const lines = [
    `E2E progress: ${done.length}/${names.length} done · ${active.length} running · ${pending} pending · ${failed.length} failed · ${formatElapsed(elapsedSeconds)}`,
  ];
  for (const name of names) {
    const result = finished.get(name);
    if (result) {
      lines.push(`  ${result.passed ? "✔" : "✖"} ${name} (${result.duration})`);
    } else if (active.includes(name)) {
      lines.push(`  ▶ ${name} (running)`);
    } else {
      lines.push(`  · ${name} (pending)`);
    }
  }
  return lines;
}
