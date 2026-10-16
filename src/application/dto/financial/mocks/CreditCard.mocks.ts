import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import CreditCardEntity, {
  CreditCardBrand,
} from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity, {
  CreditCardSummaryEntity,
} from "@domain/entities/financial/CreditCardOverviewEntity";
import InvoiceEntity, {
  InvoiceStatus,
} from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

const cardEntity = new CreditCardEntity({
  brand: CreditCardBrand.VISA,
  closingDay: 31,
  color: "#6366F1",
  dueDay: 10,
  id: "card-id",
  lastDigits: "1234",
  limit: 500000,
  owner: OwnerType.USER,
  ownerId: "user-id",
  paymentDay: 5,
  status: AccountStatus.ACTIVE,
  title: "Main card",
});

const invoiceEntity = new InvoiceEntity({
  amount: 0,
  closingDate: "2026-10-31",
  dueDate: "2026-11-10",
  listDate: "2026-11-05",
  paymentAfterDue: false,
  paymentDate: "2026-11-05",
  periodEnd: "2026-10-31",
  periodStart: "2026-10-01",
  referenceMonth: "2026-10",
  status: InvoiceStatus.OPEN,
});

const overviewEntity = new CreditCardOverviewEntity({
  aggregate: { available: 500000, totalLimit: 500000, used: 0 },
  cards: [
    new CreditCardSummaryEntity({
      available: 500000,
      card: cardEntity,
      closedInvoices: [invoiceEntity],
      openInvoice: invoiceEntity,
      upcomingInvoices: [],
      used: 0,
    }),
  ],
});

export { cardEntity, invoiceEntity, overviewEntity };
