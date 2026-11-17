// Maestro runScript (GraalJS). Outputs the device-local calendar days the balance flows use as test ids (spec 035):
// TODAY_KEY, FIRST_OF_MONTH_KEY, LAST_OF_MONTH_KEY (always listed, spec 035), YESTERDAY_KEY (`YYYY-MM-DD`), YESTERDAY_IN_PREVIOUS_MONTH ("true" on the 1st) and
// NEXT_MONTH_SAME_DAY_KEY: the day a monthly series started today occurs next month (clamped to its last day).
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function key(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}
var now = new Date();
var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
var lastNext = new Date(now.getFullYear(), now.getMonth() + 2, 0).getDate();
var next = new Date(
  now.getFullYear(),
  now.getMonth() + 1,
  Math.min(now.getDate(), lastNext),
);
output.TODAY_KEY = key(now);
output.FIRST_OF_MONTH_KEY = key(new Date(now.getFullYear(), now.getMonth(), 1));
output.LAST_OF_MONTH_KEY = key(
  new Date(now.getFullYear(), now.getMonth() + 1, 0),
);
output.YESTERDAY_KEY = key(yesterday);
output.YESTERDAY_IN_PREVIOUS_MONTH = String(
  yesterday.getMonth() !== now.getMonth(),
);
output.NEXT_MONTH_SAME_DAY_KEY = key(next);
// Spec 115: the same calendar day `n` months ago (clamped to the last day of that month) for series and buys.
function monthsAgo(n) {
  var last = new Date(now.getFullYear(), now.getMonth() - n + 1, 0).getDate();

  return new Date(
    now.getFullYear(),
    now.getMonth() - n,
    Math.min(now.getDate(), last),
  );
}
output.THREE_MONTHS_AGO_KEY = key(monthsAgo(3));
output.SIX_MONTHS_AGO_KEY = key(monthsAgo(6));
