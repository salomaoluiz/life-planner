const apiCard = {
  brand: "VISA",
  closingDay: 31,
  color: "#6366F1",
  createdAt: "2026-10-14T12:00:00.000Z",
  dueDay: 10,
  id: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  lastDigits: "1234",
  limit: 500000,
  owner: "USER",
  ownerId: "0b6a1e7c-3f4d-4b2a-8c9d-1e2f3a4b5c6d",
  paymentDay: 5,
  status: "ACTIVE",
  title: "Main card",
  updatedAt: "2026-10-14T12:00:00.000Z",
};

const apiInvoice = {
  amount: 0,
  closingDate: "2026-10-31",
  dueDate: "2026-11-10",
  paymentAfterDue: false,
  paymentDate: "2026-11-05",
  periodEnd: "2026-10-31",
  periodStart: "2026-10-01",
  referenceMonth: "2026-10",
  status: "OPEN",
};

const apiOverview = {
  aggregate: { available: 500000, totalLimit: 500000, used: 0 },
  cards: [
    {
      available: 500000,
      card: apiCard,
      closedInvoices: [{ ...apiInvoice, status: "CLOSED" }],
      openInvoice: apiInvoice,
      used: 0,
    },
  ],
};

export { apiCard, apiInvoice, apiOverview };
