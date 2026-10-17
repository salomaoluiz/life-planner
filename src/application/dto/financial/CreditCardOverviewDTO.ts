import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import InvoiceEntity, {
  InvoicePaymentEntity,
} from "@domain/entities/financial/InvoiceEntity";

export interface IInvoiceDTO {
  amount: number;
  amountDue: number;
  carryIn: number;
  closingDate: string;
  dueDate: string;
  earlyPaid: number;
  listDate: string;
  net: number;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: string;
  total: number;
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
  amountDue: number;
  carryIn: number;
  closingDate: string;
  dueDate: string;
  earlyPaid: number;
  listDate: string;
  net: number;
  payment?: InvoicePaymentEntity;
  paymentAfterDue: boolean;
  paymentDate: string;
  periodEnd: string;
  periodStart: string;
  referenceMonth: string;
  status: string;
  total: number;

  constructor(params: IInvoiceDTO) {
    this.amount = params.amount;
    this.amountDue = params.amountDue;
    this.carryIn = params.carryIn;
    this.closingDate = params.closingDate;
    this.dueDate = params.dueDate;
    this.earlyPaid = params.earlyPaid;
    this.listDate = params.listDate;
    this.net = params.net;
    this.payment = params.payment;
    this.paymentAfterDue = params.paymentAfterDue;
    this.paymentDate = params.paymentDate;
    this.periodEnd = params.periodEnd;
    this.periodStart = params.periodStart;
    this.referenceMonth = params.referenceMonth;
    this.status = params.status;
    this.total = params.total;
  }

  static fromEntity(entity: InvoiceEntity) {
    return new InvoiceDTO({
      amount: entity.amount,
      amountDue: entity.amountDue,
      carryIn: entity.carryIn,
      closingDate: entity.closingDate,
      dueDate: entity.dueDate,
      earlyPaid: entity.earlyPaid,
      listDate: entity.listDate,
      net: entity.net,
      payment: entity.payment,
      paymentAfterDue: entity.paymentAfterDue,
      paymentDate: entity.paymentDate,
      periodEnd: entity.periodEnd,
      periodStart: entity.periodStart,
      referenceMonth: entity.referenceMonth,
      status: entity.status,
      total: entity.total,
    });
  }
}

export default CreditCardOverviewDTO;
