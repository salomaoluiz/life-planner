const DEFAULT_SECONDS = 40;

// Last known duration (seconds) per flow file, read from a Maestro JUnit report.
export function parseDurations(xml) {
  const durations = {};
  for (const match of xml.matchAll(/<testcase\b([^>]*?)(?:\/>|>)/g)) {
    const file = /\bfile="([^"]+)"/.exec(match[1]);
    const time = /\btime="([\d.]+)"/.exec(match[1]);
    if (file && time) {
      durations[file[1]] = Number(time[1]);
    }
  }
  return durations;
}

export function resolveWorkers({ env, option }) {
  const value = Number(option ?? env.E2E_WORKERS);
  return Number.isInteger(value) && value >= 1 ? value : 2;
}

// Greedy, longest first, onto the worker with the smallest total, so heavy flows land on different workers.
export function splitFlows(files, durations, workers) {
  const groups = Array.from({ length: workers }, () => ({
    files: [],
    seconds: 0,
  }));
  const weighted = files
    .map((file) => ({ file, seconds: durations[file] ?? DEFAULT_SECONDS }))
    .sort((a, b) => b.seconds - a.seconds || a.file.localeCompare(b.file));
  for (const { file, seconds } of weighted) {
    const target = groups.reduce((best, group) =>
      group.seconds < best.seconds ? group : best,
    );
    target.files.push(file);
    target.seconds += seconds;
  }
  return groups.map((group) => group.files).filter((list) => list.length > 0);
}
