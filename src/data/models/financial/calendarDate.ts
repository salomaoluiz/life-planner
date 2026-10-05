import { FieldInvalid } from "@domain/entities/errors";

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

// The entity keeps the ISO string the date picker produces; the API stores a calendar day.
// Both directions go through the LOCAL day so a date never shifts with the timezone.
function isoToCalendarDate(iso: string): string {
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    throw new FieldInvalid({ date: iso });
  }

  const year = String(date.getFullYear()).padStart(4, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function calendarDateToIso(calendarDate: string): string {
  const match = CALENDAR_DATE.exec(calendarDate);

  if (!match) {
    throw new FieldInvalid({ date: calendarDate });
  }

  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const date = new Date(year, month - 1, day);

  // `new Date(2026, 1, 30)` silently rolls over to March: reject impossible days.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    throw new FieldInvalid({ date: calendarDate });
  }

  return date.toISOString();
}

export { calendarDateToIso, isoToCalendarDate };
