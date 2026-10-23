// Maestro runScript (GraalJS). Creates an early payment (a card credit) on an existing invoice through the API.
// The invoice must be CLOSED and still unpaid; the early payment lowers what is left to pay.
// Reads E2E_API_URL, TOKEN, CARD_ID, ACCOUNT_ID, INVOICE_MONTH, DATE, DESCRIPTION and VALUE_CENTS from env.
// Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function calendarDate(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}
var headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + TOKEN,
};
var today = calendarDate(new Date());

var earlyPayment = http.post(
  E2E_API_URL +
    "/v1/finance/credit-cards/" +
    CARD_ID +
    "/early-payments?today=" +
    today,
  {
    headers: headers,
    body: JSON.stringify({
      accountId: ACCOUNT_ID,
      date: DATE,
      description: DESCRIPTION,
      invoiceMonth: INVOICE_MONTH,
      method: "ACCOUNT",
      value: Number(VALUE_CENTS),
    }),
  },
);
if (!earlyPayment.ok) {
  throw new Error(
    "E2E setup: card early payment failed with status " + earlyPayment.status,
  );
}

output.EARLY_PAYMENT_ID = json(earlyPayment.body).id;
