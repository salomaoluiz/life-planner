// Maestro runScript (GraalJS). Creates a credit card through the API.
// Reads E2E_API_URL, TOKEN, TITLE, OWNER (undefined = USER), OWNER_ID from env. Never logs the token.
var response = http.post(E2E_API_URL + "/v1/finance/credit-cards", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    brand: "VISA",
    closingDay: 5,
    color: "#6366F1",
    dueDay: 8,
    limit: 500000,
    owner: typeof OWNER !== "undefined" && OWNER ? OWNER : "USER",
    ownerId: OWNER_ID,
    title: TITLE,
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: credit card failed with status " + response.status,
  );
}

output.CARD_ID = json(response.body).id;
