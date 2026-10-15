import CreditCardEntity from "@domain/entities/financial/CreditCardEntity";
import InvoiceEntity from "@domain/entities/financial/InvoiceEntity";

class CreditCardOverviewEntity {
  aggregate: { available: number; totalLimit: number; used: number };
  cards: CreditCardSummaryEntity[];

  constructor(params: {
    aggregate: { available: number; totalLimit: number; used: number };
    cards: CreditCardSummaryEntity[];
  }) {
    this.aggregate = params.aggregate;
    this.cards = params.cards;
  }
}

export class CreditCardSummaryEntity {
  available: number;
  card: CreditCardEntity;
  closedInvoices: InvoiceEntity[];
  openInvoice: InvoiceEntity;
  upcomingInvoices: InvoiceEntity[];
  used: number;

  constructor(params: {
    available: number;
    card: CreditCardEntity;
    closedInvoices: InvoiceEntity[];
    openInvoice: InvoiceEntity;
    upcomingInvoices: InvoiceEntity[];
    used: number;
  }) {
    this.available = params.available;
    this.card = params.card;
    this.closedInvoices = params.closedInvoices;
    this.openInvoice = params.openInvoice;
    this.upcomingInvoices = params.upcomingInvoices;
    this.used = params.used;
  }
}

export default CreditCardOverviewEntity;
