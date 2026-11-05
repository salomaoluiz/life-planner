import TransactionDTO from "@application/dto/financial/TransactionDTO";

import { clearPayRequest, getPayRequest, setPayRequest } from "./payRequest";

it("SHOULD hold the request until it is cleared", () => {
  const item = new TransactionDTO({
    category: "Home",
    categoryId: "category-id",
    date: "2026-10-28T00:00:00.000Z",
    description: "Conta de luz",
    id: "tx-1",
    owner: "USER",
    ownerId: "owner-id",
    type: "EXPENSE",
    value: "10.00",
  });

  expect(getPayRequest()).toBeUndefined();
  setPayRequest({ item });
  expect(getPayRequest()).toEqual({ item });
  clearPayRequest();
  expect(getPayRequest()).toBeUndefined();
});
