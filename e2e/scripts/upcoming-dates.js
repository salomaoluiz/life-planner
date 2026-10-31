// Maestro runScript (GraalJS). Outputs two device-local calendar days for the home upcoming list (spec 062):
// OVERDUE_DATE: three days ago (always before today, so an unpaid row dated then is overdue);
// UPCOMING_DATE: two days from now (always inside the next 7 days).
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
output.OVERDUE_DATE = key(
  new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3),
);
output.UPCOMING_DATE = key(
  new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2),
);
