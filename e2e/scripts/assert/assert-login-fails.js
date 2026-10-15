// Maestro runScript (GraalJS). Reads E2E_API_URL, EMAIL, PASSWORD. Throws unless the login answers 401.
// Never logs tokens or passwords.
var response = http.post(E2E_API_URL + "/v1/auth/login/email", {
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
});
if (response.status !== 401) {
  throw new Error("E2E assert: login expected 401 but got " + response.status);
}
