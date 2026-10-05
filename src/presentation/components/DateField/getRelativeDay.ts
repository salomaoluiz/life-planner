const DAY_MS = 24 * 60 * 60 * 1000;

export function getRelativeDay(
  date: Date,
  now: Date,
): "today" | "yesterday" | undefined {
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  const diff = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (diff === 0) {
    return "today";
  }

  return diff === 1 ? "yesterday" : undefined;
}

function startOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}
