import { buildInvoiceOptions, InvoiceSummaryLike } from "./invoiceOptions";

const card = { closingDay: 31, dueDay: 10 };
// Today is 2026-10-15: October is the open invoice, September was paid.
const summary: InvoiceSummaryLike = {
  closedInvoices: [{ referenceMonth: "2026-09", status: "PAID" }],
  openInvoice: { referenceMonth: "2026-10" },
};
const base = { card, date: "2026-10-30", summary, today: "2026-10-15" };

describe("buildInvoiceOptions (spec 095)", () => {
  it("SHOULD list the three invoices with closing and due dates", () => {
    const options = buildInvoiceOptions(base);

    expect(options.map((option) => option.month)).toEqual([
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
    expect(options[1]).toMatchObject({
      closingDate: "2026-10-31",
      dueDate: "2026-11-10",
      isComputed: true,
    });
    expect(options[2]).toMatchObject({
      closingDate: "2026-11-30",
      dueDate: "2026-12-10",
    });
  });

  it("SHOULD tell paid, open and future invoices apart AND disable only the paid neighbour", () => {
    const options = buildInvoiceOptions(base);

    expect(options.map((option) => [option.status, option.disabled])).toEqual([
      ["PAID", true],
      ["OPEN", false],
      ["FUTURE", false],
    ]);
  });

  it("SHOULD call an unpaid invoice before the open one Closed", () => {
    const options = buildInvoiceOptions({
      ...base,
      summary: { ...summary, closedInvoices: [] },
    });

    expect(options[0].status).toBe("CLOSED");
    expect(options[0].disabled).toBe(false);
  });

  it("SHOULD keep the computed invoice selectable even when it is paid", () => {
    const options = buildInvoiceOptions({
      ...base,
      date: "2026-09-20",
      summary: {
        closedInvoices: [{ referenceMonth: "2026-09", status: "PAID" }],
        openInvoice: { referenceMonth: "2026-10" },
      },
    });
    const computed = options.find((option) => option.isComputed)!;

    expect(computed).toMatchObject({
      disabled: false,
      month: "2026-09",
      status: "PAID",
    });
  });

  it("SHOULD work without a summary, taking the open invoice from today", () => {
    const options = buildInvoiceOptions({ ...base, summary: undefined });

    expect(options.map((option) => option.status)).toEqual([
      "CLOSED",
      "OPEN",
      "FUTURE",
    ]);
  });

  it("SHOULD wrap the year", () => {
    const options = buildInvoiceOptions({
      ...base,
      card: { closingDay: 10, dueDay: 20 },
      date: "2026-12-20",
      summary: undefined,
      today: "2026-12-20",
    });

    expect(options.map((option) => option.month)).toEqual([
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
    expect(options[1]).toMatchObject({ isComputed: true, status: "OPEN" });
  });

  it("SHOULD add a stored month outside the three as a read-only fourth option", () => {
    const options = buildInvoiceOptions({ ...base, storedMonth: "2026-01" });

    expect(options).toHaveLength(4);
    expect(options[0]).toMatchObject({
      disabled: false,
      month: "2026-01",
      readOnly: true,
    });
    expect(options.filter((option) => option.readOnly)).toHaveLength(1);
  });

  it("SHOULD NOT duplicate a stored month that is already one of the three", () => {
    const options = buildInvoiceOptions({ ...base, storedMonth: "2026-11" });

    expect(options).toHaveLength(3);
    expect(options.some((option) => option.readOnly)).toBe(false);
  });
});
