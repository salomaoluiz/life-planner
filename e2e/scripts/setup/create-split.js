// Maestro runScript (GraalJS). Creates a split transaction through the API (spec 119).
// Reads E2E_API_URL, TOKEN, ACCOUNT_ID, CATEGORY_ID and DESCRIPTION from env. Two expense parts (120,00 and 50,00)
// and a discount adjustment of 4,40, dated today and paid. Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function today() {
  var now = new Date();
  return (
    now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate())
  );
}
var response = http.post(E2E_API_URL + "/v1/finance/splits?today=" + today(), {
  headers: {
    "Content-Type": "application/json",
    Authorization: "Bearer " + TOKEN,
  },
  body: JSON.stringify({
    accountId: ACCOUNT_ID,
    date: today(),
    description: DESCRIPTION,
    paid: true,
    parts: [
      { categoryId: CATEGORY_ID, type: "EXPENSE", value: 12000 },
      {
        categoryId: CATEGORY_ID,
        description: "Detergente",
        type: "EXPENSE",
        value: 5000,
      },
      { systemKey: "SPLIT_ADJUSTMENT", type: "EXPENSE", value: -440 },
    ],
  }),
});
if (!response.ok) {
  throw new Error("E2E setup: split failed with status " + response.status);
}

output.SPLIT_ID = json(response.body).item.id;
