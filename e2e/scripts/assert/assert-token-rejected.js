// Maestro runScript (GraalJS). Reads E2E_API_URL, TOKEN. Throws unless GET /v1/user/me answers 401.
// Never logs tokens or passwords.
var response = http.get(E2E_API_URL + "/v1/user/me", {
  headers: { Authorization: "Bearer " + TOKEN },
});
if (response.status !== 401) {
  throw new Error("E2E assert: token expected 401 but got " + response.status);
}
