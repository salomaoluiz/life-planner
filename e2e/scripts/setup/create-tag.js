// Maestro runScript (GraalJS). Creates a financial tag through the API.
// Reads E2E_API_URL, TOKEN, NAME, OWNER (undefined = USER; USER, FAMILY or ALL), OWNER_ID from env. Never logs the token.
var tagOwner = typeof OWNER !== "undefined" && OWNER ? OWNER : "USER";
var response = http.post(E2E_API_URL + "/v1/finance/tags", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    name: NAME,
    owner: tagOwner,
    // OWNER ALL (spec 043) is for the Personal scope and every family: no ownerId.
    ownerId: tagOwner === "ALL" ? undefined : OWNER_ID,
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: tag failed with status " + response.status);
}

output.TAG_ID = json(response.body).id;
