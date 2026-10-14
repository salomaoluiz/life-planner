// Maestro runScript (GraalJS). Creates a financial account through the API.
// Reads E2E_API_URL, TOKEN, NAME, ICON, BALANCE_CENTS, STATUS, OWNER, OWNER_ID from env. Never logs the token.
var response = http.post(E2E_API_URL + "/v1/finance/accounts", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    balance: Number(BALANCE_CENTS),
    icon: ICON,
    name: NAME,
    owner: OWNER,
    ownerId: OWNER_ID,
    status: STATUS,
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: account failed with status " + response.status);
}

output.ACCOUNT_ID = json(response.body).id;
