// Maestro runScript (GraalJS). Creates a family through the API; the caller becomes its owner.
// Reads E2E_API_URL, TOKEN, NAME from env. Never logs the token.
var response = http.post(E2E_API_URL + "/v1/families", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({ name: NAME }),
});
if (!response.ok) {
  throw new Error("E2E setup: family failed with status " + response.status);
}

output.FAMILY_ID = json(response.body).id;
