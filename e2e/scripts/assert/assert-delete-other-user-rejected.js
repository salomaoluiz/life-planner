// Maestro runScript (GraalJS). Reads E2E_API_URL, TOKEN (the attacker), VICTIM_EMAIL. Throws unless DELETE /v1/user/me answers 422.
// Never logs tokens or passwords.
var response = http.request(E2E_API_URL + "/v1/user/me", {
  method: "DELETE",
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({ email: VICTIM_EMAIL }),
});
if (response.status !== 422) {
  throw new Error(
    "E2E assert: delete with another email expected 422 but got " +
      response.status,
  );
}
