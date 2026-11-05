// Maestro runScript (GraalJS). Pays a card invoice from an account through the API.
// Reads E2E_API_URL, TOKEN, CARD_ID, ACCOUNT_ID and INVOICE_MONTH (YYYY-MM) from env. Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
var now = new Date();
var today =
  now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate());

var payment = http.post(
  E2E_API_URL +
    "/v1/finance/credit-cards/" +
    CARD_ID +
    "/invoices/" +
    INVOICE_MONTH +
    "/payment?today=" +
    today,
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({ accountId: ACCOUNT_ID, method: "ACCOUNT" }),
  },
);
if (!payment.ok) {
  throw new Error(
    "E2E setup: invoice payment failed with status " + payment.status,
  );
}
