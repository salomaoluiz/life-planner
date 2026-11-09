// Maestro runScript (GraalJS). Creates a transfer between two accounts through the API (spec 098).
// Reads E2E_API_URL, TOKEN, FROM_ACCOUNT_ID, TO_ACCOUNT_ID, DESCRIPTION, AMOUNT_OUT_CENTS and the optional
// AMOUNT_IN_CENTS (needed between currencies) from env. The transfer is dated today and paid.
// Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function today() {
  var now = new Date();
  return (
    now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
  );
}
function param(value, fallback) {
  return typeof value !== "undefined" && value ? value : fallback;
}
var amountIn = param(
  typeof AMOUNT_IN_CENTS === "undefined" ? undefined : AMOUNT_IN_CENTS,
  undefined,
);
var response = http.post(
  E2E_API_URL + "/v1/finance/transfers?today=" + today(),
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      amountIn: amountIn === undefined ? undefined : Number(amountIn),
      amountOut: Number(AMOUNT_OUT_CENTS),
      dateOut: today(),
      description: param(
        typeof DESCRIPTION === "undefined" ? undefined : DESCRIPTION,
        "E2E transfer",
      ),
      fromAccountId: FROM_ACCOUNT_ID,
      paid: true,
      toAccountId: TO_ACCOUNT_ID,
    }),
  },
);
if (!response.ok) {
  throw new Error("E2E setup: transfer failed with status " + response.status);
}

output.TRANSFER_ID = json(response.body).item.id;
