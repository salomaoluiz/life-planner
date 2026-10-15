// Maestro runScript (GraalJS). Creates a financial account through the API.
// Reads E2E_API_URL, TOKEN, NAME, ICON, OWNER_ID from env, plus the optional caller-scoped params
// OWNER (undefined = USER), BALANCE_CENTS (the INITIAL balance, undefined = 0) and STATUS (undefined = ACTIVE).
// Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value ? value : fallback;
}
var response = http.post(E2E_API_URL + "/v1/finance/accounts", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    icon: ICON,
    initialBalance: Number(
      param(
        typeof BALANCE_CENTS === "undefined" ? undefined : BALANCE_CENTS,
        "0",
      ),
    ),
    name: NAME,
    owner: param(typeof OWNER === "undefined" ? undefined : OWNER, "USER"),
    ownerId: OWNER_ID,
    status: param(typeof STATUS === "undefined" ? undefined : STATUS, "ACTIVE"),
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: account failed with status " + response.status);
}

output.ACCOUNT_ID = json(response.body).id;
