// Maestro runScript (GraalJS). Creates an investment asset through the API (spec 102).
// Reads E2E_API_URL, TOKEN, TICKER, NAME, OWNER_ID from env, plus the optional caller-scoped params
// ASSET_CLASS (PRIVATE default: a quoted class needs a ticker the market source knows, spec 104), CURRENCY (BRL default), CURRENT_UNIT_PRICE (none default) and OWNER (USER default).
// Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
var response = http.post(E2E_API_URL + "/v1/investments/assets", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    assetClass: param(
      typeof ASSET_CLASS === "undefined" ? undefined : ASSET_CLASS,
      "PRIVATE",
    ),
    currency: param(
      typeof CURRENCY === "undefined" ? undefined : CURRENCY,
      "BRL",
    ),
    currentUnitPrice: param(
      typeof CURRENT_UNIT_PRICE === "undefined"
        ? undefined
        : CURRENT_UNIT_PRICE,
      undefined,
    ),
    name: NAME,
    owner: param(typeof OWNER === "undefined" ? undefined : OWNER, "USER"),
    ownerId: OWNER_ID,
    ticker: TICKER,
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: investment asset failed with status " + response.status,
  );
}

output.ASSET_ID = json(response.body).id;
