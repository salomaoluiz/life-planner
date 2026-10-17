import CardInvoiceDTO from "@application/dto/financial/CardInvoiceDTO";
import { InvoiceDTO } from "@application/dto/financial/CreditCardOverviewDTO";
import { InvoiceCreditEntity } from "@domain/entities/financial/CardInvoiceEntity";

import CardInvoiceUIModel from "../models/CardInvoiceUIModel";

function makeInvoice(
  overrides: Partial<ConstructorParameters<typeof InvoiceDTO>[0]> = {},
  credits: InvoiceCreditEntity[] = [],
) {
  return new CardInvoiceUIModel(makeInvoiceDTO(overrides, 2, credits));
}

function makeInvoiceDTO(
  overrides: Partial<ConstructorParameters<typeof InvoiceDTO>[0]> = {},
  purchases = 2,
  credits: InvoiceCreditEntity[] = [],
) {
  return new CardInvoiceDTO({
    card: {
      color: "#2B3A8C",
      id: "card-1",
      lastDigits: "1234",
      owner: "USER" as never,
      ownerId: "user-id",
      title: "Main card",
    },
    credits,
    invoice: new InvoiceDTO({
      amount: 45000,
      amountDue: 45000,
      carryIn: 0,
      closingDate: "2026-10-31",
      dueDate: "2026-11-10",
      earlyPaid: 0,
      listDate: "2026-11-05",
      net: 45000,
      paymentAfterDue: false,
      paymentDate: "2026-11-05",
      periodEnd: "2026-10-31",
      periodStart: "2026-10-01",
      referenceMonth: "2026-10",
      status: "CLOSED",
      total: 45000,
      ...overrides,
    }),
    purchases: [
      {
        category: "Food",
        categoryIcon: "cart",
        categoryIconColor: "#2E7D32",
        categoryId: "cat-1",
        date: "2026-10-02",
        description: "Market",
        id: "purchase-1",
        ownerId: "user-id",
        prepaid: true,
        value: 25000,
      },
      {
        category: "Transport",
        categoryId: "cat-2",
        date: "2026-10-28",
        description: "Fuel",
        id: "purchase-2",
        installmentCount: 10,
        installmentNumber: 3,
        ownerId: "user-id",
        value: 20000,
      },
    ].slice(0, purchases),
  });
}

export { makeInvoice, makeInvoiceDTO };
