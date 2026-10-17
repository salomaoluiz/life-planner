import { CreditCardSummaryDTO } from "@application/dto/financial/CreditCardOverviewDTO";

import {
  assignableInvoices,
  defaultInvoiceMonth,
  toCalendarDate,
  todayDate,
} from "./creditSheet";

function invoice(referenceMonth: string, amount: number, payment?: object) {
  return {
    amount,
    payment,
    referenceMonth,
    total: amount,
  };
}

const summary = {
  closedInvoices: [
    invoice("2026-09", 1000),
    invoice("2026-08", 0, { amount: 5, method: "EXTERNAL", paidOn: "x" }),
  ],
  openInvoice: invoice("2026-10", 300),
} as unknown as CreditCardSummaryDTO;

it("SHOULD list the open invoice first, then the closed ones WITHOUT a payment record", () => {
  expect(assignableInvoices(summary)).toEqual([
    { amountDueCents: 300, month: "2026-10", status: "OPEN", totalCents: 300 },
    {
      amountDueCents: 1000,
      month: "2026-09",
      status: "CLOSED",
      totalCents: 1000,
    },
  ]);
  expect(assignableInvoices(undefined)).toEqual([]);
});

it("SHOULD pick the invoice of the date WHEN it can take credits, else the open one", () => {
  const invoices = assignableInvoices(summary);

  // Closing day 10: 16/09 is already on the October invoice (open); 05/09 is on September (closed).
  expect(defaultInvoiceMonth("2026-09-05", 10, invoices)).toBe("2026-09");
  expect(defaultInvoiceMonth("2026-09-16", 10, invoices)).toBe("2026-10");
  expect(defaultInvoiceMonth("2026-06-05", 10, invoices)).toBe("2026-10");
  expect(defaultInvoiceMonth("2026-06-05", 10, [])).toBeUndefined();
});

it("SHOULD format a local date and give today at midnight", () => {
  jest.useFakeTimers().setSystemTime(new Date(2026, 9, 16, 18, 30));

  expect(toCalendarDate(new Date(2026, 0, 5))).toBe("2026-01-05");
  expect(todayDate()).toEqual(new Date(2026, 9, 16));
});
