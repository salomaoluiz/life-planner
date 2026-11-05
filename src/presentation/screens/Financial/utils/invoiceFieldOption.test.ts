import { buildInvoiceOptions } from "@screens/Financial/models/invoiceOptions";

import { toInvoiceFieldOption } from "./invoiceFieldOption";

// The key and its params, so the copy rules are visible without the real translations.
const t = ((key: string, params?: Record<string, string>) =>
  params ? `${key}|${JSON.stringify(params)}` : key) as never;

const options = buildInvoiceOptions({
  card: { closingDay: 31, dueDay: 10 },
  date: "2026-10-30",
  paidMonths: ["2026-09"],
  today: "2026-10-15",
});
const [paid, open, future] = options.map((option) =>
  toInvoiceFieldOption(option, t, "en-US"),
);

describe("toInvoiceFieldOption (spec 095)", () => {
  it("SHOULD title the computed invoice 'by date' AND mark an open one with the income tone", () => {
    expect(open.title).toBe(
      'financial.transactions.form.invoiceByDate|{"month":"October"}',
    );
    expect(open.statusLabel).toBe(
      "financial.transactions.form.invoiceStatus.open",
    );
    expect(open.statusTone).toBe("income");
    expect(open.subtitle).toBe(
      'financial.transactions.form.invoiceCloses|{"closing":"31/10","due":"10/11"}',
    );
  });

  it("SHOULD give a paid neighbour its reason as text AND disable it", () => {
    expect(paid.disabled).toBe(true);
    expect(paid.subtitle).toBe("financial.transactions.form.invoicePaidOption");
    expect(paid.statusTone).toBe("neutral");
  });

  it("SHOULD show the closed field label with the month and the due day", () => {
    expect(future.fieldLabel).toBe(
      'financial.transactions.form.invoiceFieldValue|{"due":"10/12","month":"November"}',
    );
    expect(future.value).toBe("2026-11");
  });

  it("SHOULD name the year of a stored month outside the three options", () => {
    const [old] = buildInvoiceOptions({
      card: { closingDay: 31, dueDay: 10 },
      date: "2026-10-30",
      storedMonth: "2025-01",
      today: "2026-10-15",
    }).map((option) => toInvoiceFieldOption(option, t, "en-US"));

    expect(old.title).toBe("January 2025");
  });
});
