// Maestro runScript (GraalJS). Creates a financial transaction through the API.
// Reads E2E_API_URL, TOKEN, DESCRIPTION, VALUE_CENTS, DATE (empty = computed), MONTHS_AGO (0 = today,
// n = the 10th of the month n months ago), TYPE, ACCOUNT_ID, CATEGORY_ID, OWNER, OWNER_ID from env.
// Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function computeDate() {
  var now = new Date();
  var monthsAgo = typeof MONTHS_AGO === "undefined" ? 0 : Number(MONTHS_AGO);
  if (!monthsAgo) {
    return (
      now.getFullYear() +
      "-" +
      pad(now.getMonth() + 1) +
      "-" +
      pad(now.getDate())
    );
  }
  var target = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 10);
  return target.getFullYear() + "-" + pad(target.getMonth() + 1) + "-10";
}
function param(value, fallback) {
  return typeof value !== "undefined" && value ? value : fallback;
}
var date = typeof DATE !== "undefined" && DATE ? DATE : computeDate();
var response = http.post(E2E_API_URL + "/v1/finance/transactions", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    accountId: ACCOUNT_ID,
    categoryId: CATEGORY_ID,
    date: date,
    description: param(
      typeof DESCRIPTION === "undefined" ? undefined : DESCRIPTION,
      "E2E transaction",
    ),
    owner: param(typeof OWNER === "undefined" ? undefined : OWNER, "USER"),
    ownerId: OWNER_ID,
    type: param(typeof TYPE === "undefined" ? undefined : TYPE, "EXPENSE"),
    value: Number(
      param(typeof VALUE_CENTS === "undefined" ? undefined : VALUE_CENTS, 1000),
    ),
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: transaction failed with status " + response.status,
  );
}

output.TRANSACTION_ID = json(response.body).id;
