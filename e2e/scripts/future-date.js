// Maestro runScript (GraalJS). Outputs two calendar dates (device local days) for the balance flows:
// NEXT_MONTH_DATE: the 10th of next month (always after this month, so no balance counts it);
// LATER_THIS_MONTH_DATE: the last day of this month, or "" when today already is the last day
// (then nothing can be dated later in this month).
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
var now = new Date();
var next = new Date(now.getFullYear(), now.getMonth() + 1, 10);
var last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
output.NEXT_MONTH_DATE =
  next.getFullYear() + "-" + pad(next.getMonth() + 1) + "-10";
output.LATER_THIS_MONTH_DATE =
  last.getDate() > now.getDate()
    ? last.getFullYear() +
      "-" +
      pad(last.getMonth() + 1) +
      "-" +
      pad(last.getDate())
    : "";
