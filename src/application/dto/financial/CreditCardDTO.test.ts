import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";

import CreditCardDTO from "./CreditCardDTO";
import { cardEntity } from "./mocks/CreditCard.mocks";

it("SHOULD copy every field of the entity", () => {
  expect({ ...CreditCardDTO.fromEntity(cardEntity) }).toEqual({
    brand: "VISA",
    closingDay: 31,
    color: "#6366F1",
    currency: "BRL",
    dueDay: 10,
    id: "card-id",
    lastDigits: "1234",
    limit: 500000,
    owner: "USER",
    ownerId: "user-id",
    paymentDay: 5,
    status: "ACTIVE",
    title: "Main card",
  });
});

it("SHOULD keep lastDigits and paymentDay undefined WHEN absent", () => {
  const dto = CreditCardDTO.fromEntity(
    new CreditCardEntity({
      ...cardEntity,
      lastDigits: undefined,
      paymentDay: undefined,
    }),
  );

  expect(dto.lastDigits).toBeUndefined();
  expect(dto.paymentDay).toBeUndefined();
});
