export const apiInstallmentPlan = {
  installments: [
    {
      id: "row-1",
      installmentNumber: 1,
      invoiceMonth: "2026-10",
      invoiceStatus: "OPEN",
      value: 3334,
    },
    {
      id: "row-2",
      installmentNumber: 2,
      invoiceMonth: "2026-11",
      invoiceStatus: "PAID",
      value: 3333,
    },
  ],
  overLimit: true,
  plan: {
    categoryId: "category-1",
    creditCardId: "card-1",
    date: "2026-10-20",
    description: "Notebook",
    id: "plan-1",
    installmentCount: 2,
    owner: "USER",
    ownerId: "user-id",
    totalValue: 6667,
  },
};
