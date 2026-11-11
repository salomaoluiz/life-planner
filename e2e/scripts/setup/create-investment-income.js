// Maestro runScript (GraalJS). Creates an investment income through the API (spec 107).
// Reads E2E_API_URL, TOKEN, ASSET_ID, ACCOUNT_ID, CATEGORY_ID, NET_CENTS and the optional caller-scoped params
// STATUS (PLANNED default) and TYPE (DIVIDEND default). The payment date is today. Never logs the token.
function param(value, fallback) {
  return typeof value !== "undefined" && value !== "" ? value : fallback;
}
var today = new Date();
var month = String(today.getMonth() + 1);
var day = String(today.getDate());
var paymentDate =
  today.getFullYear() +
  "-" +
  (month.length < 2 ? "0" + month : month) +
  "-" +
  (day.length < 2 ? "0" + day : day);
var response = http.post(E2E_API_URL + "/v1/investments/incomes", {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    accountId: ACCOUNT_ID,
    assetId: ASSET_ID,
    categoryId: CATEGORY_ID,
    netAmount: Number(NET_CENTS),
    paymentDate: paymentDate,
    status: param(
      typeof STATUS === "undefined" ? undefined : STATUS,
      "PLANNED",
    ),
    type: param(typeof TYPE === "undefined" ? undefined : TYPE, "DIVIDEND"),
  }),
});
if (!response.ok) {
  throw new Error(
    "E2E setup: investment income failed with status " + response.status,
  );
}

output.INCOME_ID = json(response.body).item.id;
