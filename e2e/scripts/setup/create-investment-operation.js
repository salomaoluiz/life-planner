// Maestro runScript (GraalJS). Records a buy or sell through the API (spec 102).
// Reads E2E_API_URL, TOKEN, ASSET_ID, TYPE (BUY|SELL), QUANTITY and UNIT_PRICE (decimal text) from env, plus the optional
// caller-scoped params DATE (today default), ACCOUNT_ID (none = no finance entry). Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
function today() {
  var now = new Date();
  var month = String(now.getMonth() + 1);
  var day = String(now.getDate());

  return (
    now.getFullYear() +
    "-" +
    (month.length < 2 ? "0" + month : month) +
    "-" +
    (day.length < 2 ? "0" + day : day)
  );
}
var accountId = param(
  typeof ACCOUNT_ID === "undefined" ? undefined : ACCOUNT_ID,
  undefined,
);
var response = http.post(
  E2E_API_URL + "/v1/investments/assets/" + ASSET_ID + "/operations",
  {
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + TOKEN,
    },
    body: JSON.stringify({
      accountId: accountId,
      date: param(typeof DATE === "undefined" ? undefined : DATE, today()),
      generateTransaction: typeof accountId !== "undefined",
      quantity: QUANTITY,
      type: TYPE,
      unitPrice: UNIT_PRICE,
    }),
  },
);
if (!response.ok) {
  throw new Error(
    "E2E setup: investment operation failed with status " + response.status,
  );
}

output.OPERATION_ID = json(response.body).item.id;
