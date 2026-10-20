import CreditCardModel from "./CreditCardModel";
import { apiCard } from "./mocks/CreditCard.mocks";

it("SHOULD map every field AND keep the limit in cents", () => {
  const model = CreditCardModel.fromJSON(apiCard);

  expect({ ...model }).toEqual({
    brand: "VISA",
    closingDay: 31,
    color: "#6366F1",
    currency: "BRL",
    dueDay: 10,
    id: apiCard.id,
    lastDigits: "1234",
    limit: 500000,
    owner: "USER",
    ownerId: apiCard.ownerId,
    paymentDay: 5,
    status: "ACTIVE",
    title: "Main card",
  });
});

it("SHOULD turn missing or null lastDigits and paymentDay into undefined", () => {
  const model = CreditCardModel.fromJSON({
    ...apiCard,
    lastDigits: null,
    paymentDay: null,
  });
  const missing = CreditCardModel.fromJSON({
    ...apiCard,
    lastDigits: undefined,
    paymentDay: undefined,
  });

  expect(model.lastDigits).toBeUndefined();
  expect(model.paymentDay).toBeUndefined();
  expect(missing.lastDigits).toBeUndefined();
  expect(missing.paymentDay).toBeUndefined();
});
