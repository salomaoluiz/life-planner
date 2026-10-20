// Maestro runScript (GraalJS). Creates a financial category through the API.
// Reads E2E_API_URL, TOKEN, NAME, ICON, ICON_COLOR, TYPE (undefined = EXPENSE), OWNER (undefined = USER; USER, FAMILY or ALL), OWNER_ID, PARENT_ID (optional, undefined = root) from env. Never logs the token.
var categoryType = typeof TYPE !== "undefined" && TYPE ? TYPE : "EXPENSE";
var categoryOwner = typeof OWNER !== "undefined" && OWNER ? OWNER : "USER";
var response = http.post(E2E_API_URL + "/v1/finance/categories", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    icon: ICON,
    iconColor: ICON_COLOR,
    name: NAME,
    owner: categoryOwner,
    // OWNER ALL (spec 038) is for the Personal scope and every family: no ownerId.
    ownerId: categoryOwner === "ALL" ? undefined : OWNER_ID,
    parentId:
      typeof PARENT_ID !== "undefined" && PARENT_ID ? PARENT_ID : undefined,
    type: categoryType,
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: category failed with status " + response.status);
}

output.CATEGORY_ID = json(response.body).id;
