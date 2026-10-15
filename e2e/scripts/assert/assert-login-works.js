// Maestro runScript (GraalJS). Reads E2E_API_URL, EMAIL, PASSWORD. Throws unless the login succeeds (2xx).
// Never logs tokens or passwords.
var response = http.post(E2E_API_URL + "/v1/auth/login/email", {
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (!response.ok) {
  throw new Error("E2E assert: login expected 2xx but got " + response.status);
}
