// Maestro runScript (GraalJS). Outputs the device-local calendar days the balance flows use as test ids (spec 035):
// TODAY_KEY, YESTERDAY_KEY (`YYYY-MM-DD`), YESTERDAY_IN_PREVIOUS_MONTH ("true" on the 1st) and
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
output.YESTERDAY_KEY = key(yesterday);
output.YESTERDAY_IN_PREVIOUS_MONTH = String(
  yesterday.getMonth() !== now.getMonth(),
);
output.NEXT_MONTH_SAME_DAY_KEY = key(next);
