import UpcomingDTO, {
  UpcomingItemDTO,
} from "@application/dto/home/UpcomingDTO";

import UpcomingUIModel from "./UpcomingUIModel";

const now = new Date(2026, 10, 12, 10);

function item(
  date: string,
  overrides: Partial<UpcomingItemDTO> = {},
): UpcomingItemDTO {
  return {
    accountId: "account-id",
    categoryId: "category-id",
    creditCardId: null,
    currency: "BRL",
    date,
    description: "Rent",
    id: `id-${date}`,
    invoiceMonth: null,
    kind: "TRANSACTION",
    occurrenceNumber: null,
    owner: "USER",
    ownerId: "owner-id",
    purchaseCount: null,
    recurrenceId: null,
    type: "EXPENSE",
    valueCents: 1000,
    ...overrides,
  };
}
function model(
  overdue: UpcomingItemDTO[],
  next: UpcomingItemDTO[],
  total = next.length,
) {
  return new UpcomingUIModel(
    new UpcomingDTO({
      next,
      nextTotal: total,
      overdue,
      overdueExpenseCents: 317000,
    }),
    now,
    "en-US",
  );
}

it("SHOULD keep every overdue row in order and the next rows with their total", () => {
  const overdue = Array.from({ length: 8 }, (_, index) =>
    item(`2026-11-0${index + 1}`),
  );
  const next = ["13", "14", "15", "16", "17"].map((day) =>
    item(`2026-11-${day}`),
  );
  const result = model(overdue, next, 7);

  expect(result.overdue.rows).toHaveLength(8);
  expect(result.overdue.rows[0].id).toBe("id-2026-11-01");
  expect(result.overdue.count).toBe(8);
  expect(result.overdue.expenseTotal).toBe(317000);
  expect(result.next.rows).toHaveLength(5);
  expect(result.next.count).toBe(7);
  expect(result.isEmpty).toBe(false);
});

it("SHOULD be empty WHEN nothing is overdue and nothing is coming", () => {
  expect(model([], []).isEmpty).toBe(true);
});

it("SHOULD badge an item due yesterday as overdue yesterday and older ones with their days", () => {
  const rows = model([item("2026-11-11"), item("2026-10-28")], []).overdue.rows;

  expect(rows[0].badge).toEqual({
    key: "home.upcoming.overdueDays_one",
    params: { count: 1 },
    tone: "expense",
  });
  expect(rows[1].badge).toEqual({
    key: "home.upcoming.overdueDays_other",
    params: { count: 15 },
    tone: "expense",
  });
});

it("SHOULD badge income as to receive and projections as projected, and nothing for a plain expense", () => {
  const rows = model(
    [],
    [
      item("2026-11-16", { type: "INCOME" }),
      item("2026-11-18", {
        kind: "PROJECTION",
        occurrenceNumber: 4,
        recurrenceId: "r",
      }),
      item("2026-11-17"),
    ],
  ).next.rows;

  expect(rows[0].badge?.key).toBe("home.upcoming.toReceive");
  expect(rows[1].badge?.key).toBe("home.upcoming.projected");
  expect(rows[2].badge).toBeUndefined();
});

it("SHOULD treat an invoice as one row with its purchase count and no to-receive badge", () => {
  const [row] = model(
    [],
    [
      item("2026-11-15", {
        creditCardId: "card-id",
        description: "Main card",
        invoiceMonth: "2026-11",
        kind: "INVOICE",
        purchaseCount: 23,
      }),
    ],
  ).next.rows;

  expect(row.isInvoice).toBe(true);
  expect(row.purchaseCount).toBe(23);
  expect(row.badge).toBeUndefined();
  expect(row.dateText).toBe("Nov 15");
});
