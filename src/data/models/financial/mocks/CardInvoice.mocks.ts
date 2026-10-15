import { apiInvoice } from "@data/models/financial/mocks/CreditCard.mocks";

const apiCardInvoice = {
  card: {
    color: "#2B3A8C",
    id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
    lastDigits: "1234",
    owner: "USER",
    ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
    title: "Main card",
  },
  invoice: { ...apiInvoice, amount: 45000, status: "CLOSED" },
  purchases: [
    {
      category: "Food",
      categoryIcon: "cart",
      categoryIconColor: "#2E7D32",
      categoryId: "7820cfbb-f1aa-4254-8e42-7a0fe1ee981f",
      date: "2026-10-02",
      description: "Market",
      id: "9e6cd00a-f854-48c0-be6d-c2e904bfd9b7",
      ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
      value: 25000,
    },
  ],
};
const apiPayment = {
  accountId: "c5598687-dfeb-485e-990a-a035d8e7d23d",
  accountName: "Checking",
  amount: 45000,
  method: "ACCOUNT",
  paidOn: "2026-11-05",
};

export { apiCardInvoice, apiPayment };
