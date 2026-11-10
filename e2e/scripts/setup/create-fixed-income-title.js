// Maestro runScript (GraalJS). Creates a calculated fixed income title through the API (spec 105).
// Reads E2E_API_URL, TOKEN, OWNER_ID, NAME from env, plus the optional caller-scoped params
// AMOUNT_CENTS (1000000), DATE (2026-01-15), MATURITY_DATE (2030-01-15), LIQUIDITY (DAILY), ACCOUNT_ID (none = no finance entry).
// The rate is a prefixed 12% a.a. Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
var accountId = param(
  typeof ACCOUNT_ID === "undefined" ? undefined : ACCOUNT_ID,
  undefined,
);
var response = http.post(E2E_API_URL + "/v1/investments/fixed-income", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    contribution: {
      accountId: accountId,
      amount: Number(
        param(
          typeof AMOUNT_CENTS === "undefined" ? undefined : AMOUNT_CENTS,
          "1000000",
        ),
      ),
      date: param(typeof DATE === "undefined" ? undefined : DATE, "2026-01-15"),
      generateTransaction: !!accountId,
    },
    name: NAME,
    owner: "USER",
    ownerId: OWNER_ID,
    rate: { annualRate: "12", mode: "PREFIXED" },
    terms: {
      liquidity: param(
        typeof LIQUIDITY === "undefined" ? undefined : LIQUIDITY,
        "DAILY",
      ),
      maturityDate: param(
        typeof MATURITY_DATE === "undefined" ? undefined : MATURITY_DATE,
        "2030-01-15",
      ),
      product: "CDB",
      taxExempt: false,
    },
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: fixed income title failed with status " + response.status,
  );
}

output.ASSET_ID = json(response.body).item.id;
