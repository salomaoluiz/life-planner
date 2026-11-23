import { USER_ID } from "./user";

// Spec 116: the detail of one stock item (with one lot) the movement modal reads.
const stockDetail = {
  barcode: null,
  brand: null,
  category: null,
  categoryId: null,
  createdAt: "2026-11-01T12:00:00.000Z",
  description: "Rice",
  expirationStatus: "OK",
  hasOpenLot: false,
  id: "6f1c2a4e-1b7d-4c55-9a2e-3f0d8b9c1a10",
  idealQuantity: null,
  location: null,
  locationId: null,
  lots: [
    {
      effectiveExpiration: "2027-03-01",
      expirationDate: "2027-03-01",
      expirationStatus: "OK",
      id: "lot-1",
      openedAt: null,
      purchaseDate: "2026-11-01",
      quantity: 2,
    },
  ],
  minQuantity: null,
  nearestExpiration: "2027-03-01",
  needsRestock: false,
  notes: null,
  openedShelfLifeDays: null,
  owner: "USER",
  ownerId: USER_ID,
  quantity: 2,
  restockQuantity: 1,
  stockOnly: false,
  unit: "kilogram",
  warnDaysClosed: 7,
  warnDaysOpened: 1,
};

// Spec 120: one open purchase with no rows.
const purchaseView = {
  cart: { count: 0, totalCents: 0, unpricedCount: 0 },
  forecastCents: 0,
  otherCarts: [],
  purchase: {
    accountId: null,
    closing: null,
    creditCardId: null,
    currency: "BRL",
    id: "purchase-1",
    invoiceMonth: null,
    lastActivityAt: "2026-11-18T10:00:00.000Z",
    listId: "list-1",
    marketId: "market-1",
    purchaseDate: "2026-11-18",
    receiptTotalCents: null,
    splitId: null,
    startedBy: null,
    status: "OPEN",
    transactionId: null,
  },
  remaining: { count: 0, estimatedCents: 0, pricedCount: 0 },
  rows: [],
};

export { purchaseView, stockDetail };
