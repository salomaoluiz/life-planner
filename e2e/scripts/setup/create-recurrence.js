// Maestro runScript (GraalJS). Creates a recurring series through the API (spec 034).
// Reads E2E_API_URL, TOKEN, OWNER_ID, ACCOUNT_ID, CATEGORY_ID, DESCRIPTION, VALUE_CENTS, FREQUENCY (default MONTHLY),
// MONTHS_AGO (0 = starts today, n = the 10th of the month n months ago), END_MONTHS_AFTER_START (absent = no end date),
// PAID ("true"/"false"; absent = the API default for occurrence 1), TYPE and OWNER from env.
// The API creates the real occurrences up to the end of the current month; later ones are projected.
// Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function format(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}
function param(value, fallback) {
  return typeof value !== "undefined" && value ? value : fallback;
}
var now = new Date();
var monthsAgo = typeof MONTHS_AGO === "undefined" ? 0 : Number(MONTHS_AGO);
var start = monthsAgo
  ? new Date(now.getFullYear(), now.getMonth() - monthsAgo, 10)
  : now;
var end =
  typeof END_MONTHS_AFTER_START === "undefined" || !END_MONTHS_AFTER_START
    ? undefined
    : format(
        new Date(
          start.getFullYear(),
          start.getMonth() + Number(END_MONTHS_AFTER_START),
          start.getDate(),
        ),
      );
var response = http.post(
  E2E_API_URL + "/v1/finance/recurrences?today=" + format(now),
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      accountId: ACCOUNT_ID,
      categoryId: CATEGORY_ID,
      date: format(start),
      description: param(
        typeof DESCRIPTION === "undefined" ? undefined : DESCRIPTION,
        "E2E recurring",
      ),
      endDate: end,
      frequency: param(
        typeof FREQUENCY === "undefined" ? undefined : FREQUENCY,
        "MONTHLY",
      ),
      owner: param(typeof OWNER === "undefined" ? undefined : OWNER, "USER"),
      ownerId: OWNER_ID,
      paid: typeof PAID === "undefined" || !PAID ? undefined : PAID === "true",
      type: param(typeof TYPE === "undefined" ? undefined : TYPE, "EXPENSE"),
      value: Number(
        param(
          typeof VALUE_CENTS === "undefined" ? undefined : VALUE_CENTS,
          1000,
        ),
      ),
    }),
  },
);
if (!response.ok) {
  throw new Error(
    "E2E setup: recurrence failed with status " + response.status,
  );
}

output.RECURRENCE_ID = json(response.body).recurrence.id;
