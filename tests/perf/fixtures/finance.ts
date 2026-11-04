import { USER_ID } from "./user";

const today = new Date();
const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

const accountRow = {
  accountId: "6f1c2b9e-1d2a-4c55-9a7e-0b8e3c1f2a10",
  categoryId: "1d0f8a3b-5c6e-4f70-8a91-b2c3d4e5f607",
  date: todayKey,
  description: "Weekly groceries",
  id: "c3d4e5f6-0718-4293-a4b5-c6d7e8f90a1b",
  owner: "USER",
  ownerId: USER_ID,
  type: "EXPENSE",
  value: 23490,
};

// One open card invoice of the current month, as the month endpoint sends it (spec 087 expand scenario).
const invoiceRow = {
  card: {
    color: "#1D4ED8",
    id: "9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d",
    lastDigits: "1234",
    owner: "USER",
    ownerId: USER_ID,
    title: "Main card",
  },
  credits: [],
  invoice: {
    amount: 5000,
    closingDate: todayKey,
    currency: "BRL",
    dueDate: todayKey,
    listDate: todayKey,
    paymentDate: todayKey,
    periodEnd: todayKey,
    periodStart: todayKey,
    referenceMonth: todayKey.slice(0, 7),
    status: "OPEN",
  },
  purchases: [
    {
      category: "Groceries",
      categoryId: accountRow.categoryId,
      date: todayKey,
      description: "Card purchase",
      id: "5b4a3c2d-1e0f-4a9b-8c7d-6e5f4a3b2c1d",
      ownerId: USER_ID,
      prepaid: false,
      value: 5000,
    },
  ],
};

// A "large account": enough history that a whole-history download is visible in parse time.
function largeAccountRows(count = 5000) {
  return Array.from({ length: count }, (_, index) => {
    const day = String((index % 28) + 1).padStart(2, "0");
    const month = String((Math.floor(index / 28) % 12) + 1).padStart(2, "0");
    const year = 2015 + Math.floor(index / 336);

    return {
      ...accountRow,
      date: `${year}-${month}-${day}`,
      description: `Purchase ${index}`,
      id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
      value: 1000 + index,
    };
  });
}

const overview = {
  aggregate: { available: 0, totalLimit: 0, used: 0 },
  cards: [],
};

export { accountRow, invoiceRow, largeAccountRows, overview, todayKey };
