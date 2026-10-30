import { TranslationKeys } from "@presentation/i18n/types";

interface TimeAgo {
  count: number;
  key: TranslationKeys;
}

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function formatDate(iso: null | string, localeTag: string): null | string {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(localeTag, { dateStyle: "short" }).format(date);
}

function formatDateTime(iso: null | string, localeTag: string): null | string {
  if (!iso) {
    return null;
  }
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? null
    : new Intl.DateTimeFormat(localeTag, {
        dateStyle: "short",
        timeStyle: "short",
      }).format(date);
}

// "Checked 2 min ago": the largest whole unit, or "less than a minute".
function timeAgo(iso: null | string, now: number): null | TimeAgo {
  if (!iso) {
    return null;
  }
  const elapsed = Math.max(0, now - new Date(iso).getTime());

  if (elapsed >= DAY) {
    return { count: Math.floor(elapsed / DAY), key: "versions.timeAgo.days" };
  }
  if (elapsed >= HOUR) {
    return { count: Math.floor(elapsed / HOUR), key: "versions.timeAgo.hours" };
  }
  if (elapsed >= MINUTE) {
    return {
      count: Math.floor(elapsed / MINUTE),
      key: "versions.timeAgo.minutes",
    };
  }

  return { count: 0, key: "versions.timeAgo.now" };
}

export type { TimeAgo };
export { formatDate, formatDateTime, timeAgo };
