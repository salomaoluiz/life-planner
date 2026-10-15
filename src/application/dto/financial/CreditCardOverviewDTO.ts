import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import InvoiceEntity, {
  InvoicePaymentEntity,
} from "@domain/entities/financial/InvoiceEntity";

export interface IInvoiceDTO {
  amount: number;
  closingDate: string;
  dueDate: string;
  listDate: string;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: string;
}

class CreditCardOverviewDTO {
  aggregate: { available: number; totalLimit: number; used: number };
  cards: CreditCardSummaryDTO[];

  constructor(params: {
    aggregate: { available: number; totalLimit: number; used: number };
    cards: CreditCardSummaryDTO[];
  }) {
    this.aggregate = params.aggregate;
    this.cards = params.cards;
  }

  static fromEntity(entity: CreditCardOverviewEntity) {
    return new CreditCardOverviewDTO({
      aggregate: { ...entity.aggregate },
      cards: entity.cards.map(
        (summary) =>
          new CreditCardSummaryDTO({
            available: summary.available,
            card: CreditCardDTO.fromEntity(summary.card),
            closedInvoices: summary.closedInvoices.map((invoice) =>
              InvoiceDTO.fromEntity(invoice),
            ),
            openInvoice: InvoiceDTO.fromEntity(summary.openInvoice),
            upcomingInvoices: summary.upcomingInvoices.map((invoice) =>
              InvoiceDTO.fromEntity(invoice),
            ),
            used: summary.used,
          }),
      ),
    });
  }
}

export class CreditCardSummaryDTO {
  available: number;
  card: CreditCardDTO;
  closedInvoices: InvoiceDTO[];
  openInvoice: InvoiceDTO;
  upcomingInvoices: InvoiceDTO[];
  used: number;

  constructor(params: {
    available: number;
    card: CreditCardDTO;
    closedInvoices: InvoiceDTO[];
    openInvoice: InvoiceDTO;
    upcomingInvoices: InvoiceDTO[];
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

export class InvoiceDTO implements IInvoiceDTO {
  amount: number;
  closingDate: string;
  dueDate: string;
  listDate: string;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: string;

  constructor(params: IInvoiceDTO) {
    this.amount = params.amount;
    this.closingDate = params.closingDate;
    this.dueDate = params.dueDate;
    this.listDate = params.listDate;
    this.payment = params.payment;
    this.paymentAfterDue = params.paymentAfterDue;
    this.paymentDate = params.paymentDate;
    this.periodEnd = params.periodEnd;
    this.periodStart = params.periodStart;
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
  }

  static fromEntity(entity: InvoiceEntity) {
    return new InvoiceDTO({
      amount: entity.amount,
      closingDate: entity.closingDate,
      dueDate: entity.dueDate,
      listDate: entity.listDate,
      payment: entity.payment,
      paymentAfterDue: entity.paymentAfterDue,
      paymentDate: entity.paymentDate,
      periodEnd: entity.periodEnd,
      periodStart: entity.periodStart,
      referenceMonth: entity.referenceMonth,
      status: entity.status,
    });
  }
}

export default CreditCardOverviewDTO;
