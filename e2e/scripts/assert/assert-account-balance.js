// Maestro runScript (GraalJS). Reads E2E_API_URL, TOKEN, OWNER_ID, ACCOUNT_ID and EXPECTED_CENTS.
// Throws unless the ledger balance of the account is exactly EXPECTED_CENTS. Never logs the token.
var today = new Date();
var month = String(today.getMonth() + 1);
var day = String(today.getDate());
var date =
  today.getFullYear() +
  "-" +
  (month.length < 2 ? "0" + month : month) +
  "-" +
  (day.length < 2 ? "0" + day : day);
var response = http.get(
  E2E_API_URL + "/v1/finance/accounts?ownerId=" + OWNER_ID + "&today=" + date,
  { headers: { Authorization: "Bearer " + TOKEN } },
);
if (!response.ok) {
  throw new Error("E2E assert: accounts failed with status " + response.status);
}
var accounts = json(response.body);
var found = null;
for (var i = 0; i < accounts.length; i++) {
  if (accounts[i].id === ACCOUNT_ID) {
    found = accounts[i];
  }
}
if (found === null) {
  throw new Error("E2E assert: account not found");
}
if (Number(found.balance) !== Number(EXPECTED_CENTS)) {
  throw new Error(
    "E2E assert: balance expected " +
      EXPECTED_CENTS +
      " but got " +
      found.balance,
  );
}
