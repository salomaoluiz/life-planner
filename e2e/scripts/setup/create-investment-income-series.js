// Maestro runScript (GraalJS). Creates a monthly income series through the API (spec 115).
// Reads E2E_API_URL, TOKEN, ASSET_ID, ACCOUNT_ID, CATEGORY_ID, FIRST_DATE (`YYYY-MM-DD`) and AMOUNT_PER_UNIT (decimal
// text) from env, plus the optional caller-scoped params WITH_FINANCE ("false" = only in investments) and TYPE
// (YIELD default). Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
var withFinance =
  param(
    typeof WITH_FINANCE === "undefined" ? undefined : WITH_FINANCE,
    "true",
  ) !== "false";
var body = {
  amountPerUnit: AMOUNT_PER_UNIT,
  assetId: ASSET_ID,
  firstPaymentDate: FIRST_DATE,
  frequency: { interval: 1, unit: "MONTH" },
  markPastAsReceived: true,
  type: param(typeof TYPE === "undefined" ? undefined : TYPE, "YIELD"),
  withFinance: withFinance,
};

if (withFinance) {
  body.accountId = ACCOUNT_ID;
  body.categoryId = CATEGORY_ID;
}

var response = http.post(E2E_API_URL + "/v1/investments/income-series", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify(body),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: investment income series failed with status " + response.status,
  );
}

output.SERIES_ID = json(response.body).item.id;
