// Maestro runScript (GraalJS). Creates a credit card whose latest invoice is already CLOSED and listed
// TODAY, plus one purchase on it, through the API.
// The card closes yesterday (closingDay = yesterday's day of month) and is due today (dueDay = today's
// day), so a purchase dated yesterday sits on the invoice that closed yesterday and its planned payment
// day is today, in the current month.
// Reads E2E_API_URL, TOKEN, TITLE, OWNER_ID, CATEGORY_ID, DESCRIPTION, VALUE_CENTS from env. Never logs the token.
// Optional caller-scoped params (spec 045): SECOND_CATEGORY_ID, SECOND_DESCRIPTION, SECOND_VALUE_CENTS add a second
// purchase on the same invoice.
function pad(value) {
  return value < 10 ? "0" + value : String(value);
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
    date:
      yesterday.getFullYear() +
      "-" +
      pad(yesterday.getMonth() + 1) +
      "-" +
      pad(yesterday.getDate()),
    description: DESCRIPTION,
    owner: "USER",
    ownerId: OWNER_ID,
    type: "EXPENSE",
    value: Number(VALUE_CENTS),
  }),
});
if (!purchase.ok) {
  throw new Error(
    "E2E setup: card purchase failed with status " + purchase.status,
  );
}

if (typeof SECOND_DESCRIPTION !== "undefined" && SECOND_DESCRIPTION) {
  var second = http.post(E2E_API_URL + "/v1/finance/transactions", {
    headers: headers,
    body: JSON.stringify({
      categoryId: SECOND_CATEGORY_ID,
      creditCardId: cardId,
      date:
        yesterday.getFullYear() +
        "-" +
        pad(yesterday.getMonth() + 1) +
        "-" +
        pad(yesterday.getDate()),
      description: SECOND_DESCRIPTION,
      owner: "USER",
      ownerId: OWNER_ID,
      type: "EXPENSE",
      value: Number(SECOND_VALUE_CENTS),
    }),
  });
  if (!second.ok) {
    throw new Error(
      "E2E setup: second card purchase failed with status " + second.status,
    );
  }
}

output.CARD_ID = cardId;
