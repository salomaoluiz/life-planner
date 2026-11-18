export function formatDay(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${month}-${day}`;
}

export function optionalDay(value: unknown): Date | undefined {
  return typeof value === "string" ? parseDay(value) : undefined;
}

// The API sends calendar days (`YYYY-MM-DD`). They are read and written in LOCAL time: `new Date("2026-11-20")` is UTC
// midnight and would show the previous day west of Greenwich.
export function parseDay(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);

  return new Date(year, month - 1, day);
}
