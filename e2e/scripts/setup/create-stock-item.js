// Maestro runScript (GraalJS). Creates a stock item through the API.
// Reads E2E_API_URL, TOKEN, DESCRIPTION, QUANTITY, UNIT, EXPIRATION_IN_DAYS (absent = no expiration,
// negative = already expired, 0 = today), OWNER, OWNER_ID from env. Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
var DAY_MS = 24 * 60 * 60 * 1000;
var days = param(
  typeof EXPIRATION_IN_DAYS === "undefined" ? undefined : EXPIRATION_IN_DAYS,
  undefined,
);
var body = {
  description: param(
    typeof DESCRIPTION === "undefined" ? undefined : DESCRIPTION,
    "E2E stock item",
  ),
  owner: param(typeof OWNER === "undefined" ? undefined : OWNER, "USER"),
  ownerId: OWNER_ID,
  quantity: Number(
    param(typeof QUANTITY === "undefined" ? undefined : QUANTITY, 1),
  ),
  unit: param(typeof UNIT === "undefined" ? undefined : UNIT, "unit"),
};
if (typeof days !== "undefined") {
  // Same wall-clock time N days from now: the app compares local calendar days, so this is exactly N days.
  body.expirationDate = new Date(
    Date.now() + Number(days) * DAY_MS,
  ).toISOString();
}
var response = http.post(E2E_API_URL + "/v1/stock/items", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify(body),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: stock item failed with status " + response.status,
  );
}

output.STOCK_ITEM_ID = json(response.body).id;
