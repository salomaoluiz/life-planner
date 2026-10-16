// Maestro runScript (GraalJS). Creates a credit card that closed YESTERDAY (so its last invoice is CLOSED
// and the next one is the OPEN invoice), one purchase on the closed invoice and a 3x installment plan
// bought today (installment 1/3 lands on the open invoice), through the API.
// Reads E2E_API_URL, TOKEN, TITLE, OWNER_ID, CATEGORY_ID, PURCHASE_NAME, PLAN_NAME from env. Never logs the token.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
}
function calendarDate(date) {
  return (
    date.getFullYear() +
    "-" +
    pad(date.getMonth() + 1) +
    "-" +
    pad(date.getDate())
  );
}
var headers = {
  "Content-Type": "application/json",
  Authorization: "Bearer " + TOKEN,
};
var now = new Date();
var yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);

var card = http.post(E2E_API_URL + "/v1/finance/credit-cards", {
  headers: headers,
  body: JSON.stringify({
    brand: "VISA",
    closingDay: yesterday.getDate(),
    color: "#6366F1",
    dueDay: now.getDate(),
    lastDigits: "1234",
    limit: 500000,
    owner: "USER",
    ownerId: OWNER_ID,
    title: TITLE,
  }),
});
if (!card.ok) {
  throw new Error("E2E setup: credit card failed with status " + card.status);
}
var cardId = json(card.body).id;

var purchase = http.post(E2E_API_URL + "/v1/finance/transactions", {
  headers: headers,
  body: JSON.stringify({
    categoryId: CATEGORY_ID,
    creditCardId: cardId,
    date: calendarDate(yesterday),
    description: PURCHASE_NAME,
    owner: "USER",
    ownerId: OWNER_ID,
    type: "EXPENSE",
    value: 25000,
  }),
});
if (!purchase.ok) {
  throw new Error(
    "E2E setup: card purchase failed with status " + purchase.status,
  );
}

var plan = http.post(
  E2E_API_URL + "/v1/finance/installment-plans?today=" + calendarDate(now),
  {
    headers: headers,
    body: JSON.stringify({
      categoryId: CATEGORY_ID,
      creditCardId: cardId,
      date: calendarDate(now),
      description: PLAN_NAME,
      installments: 3,
      owner: "USER",
      ownerId: OWNER_ID,
      value: 30000,
    }),
  },
);
if (!plan.ok) {
  throw new Error(
    "E2E setup: installment plan failed with status " + plan.status,
  );
}

output.CARD_ID = cardId;
output.CLOSED_MONTH = calendarDate(yesterday).slice(0, 7);
output.PLAN_ID = json(plan.body).plan.id;
output.PURCHASE_ID = json(purchase.body).id;
