// Maestro runScript (GraalJS). Creates a financial transaction through the API.
// Reads E2E_API_URL, TOKEN, DESCRIPTION, VALUE_CENTS, DATE (empty = today), TYPE, ACCOUNT_ID, CATEGORY_ID,
// OWNER, OWNER_ID from env. Never logs the token.
var date = DATE ? DATE : new Date().toISOString().slice(0, 10);
var response = http.post(E2E_API_URL + "/v1/finance/transactions", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    accountId: ACCOUNT_ID,
    categoryId: CATEGORY_ID,
    date: date,
    description: DESCRIPTION,
    owner: OWNER,
    ownerId: OWNER_ID,
    type: TYPE,
    value: Number(VALUE_CENTS),
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: transaction failed with status " + response.status,
  );
}

output.TRANSACTION_ID = json(response.body).id;
