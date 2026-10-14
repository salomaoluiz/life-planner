// Maestro runScript (GraalJS). Creates a financial category through the API.
// Reads E2E_API_URL, TOKEN, NAME, ICON, ICON_COLOR, TYPE, OWNER, OWNER_ID from env. Never logs the token.
var response = http.post(E2E_API_URL + "/v1/finance/categories", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    icon: ICON,
    iconColor: ICON_COLOR,
    name: NAME,
    owner: OWNER,
    ownerId: OWNER_ID,
    type: TYPE,
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: category failed with status " + response.status);
}

output.CATEGORY_ID = json(response.body).id;
