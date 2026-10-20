import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export enum CreditCardBrand {
  AMEX = "AMEX",
  ELO = "ELO",
  MASTERCARD = "MASTERCARD",
  OTHER = "OTHER",
  VISA = "VISA",
}

// The account that pays the invoice (spec 035); `null` while `paymentAccountId` is set = the reader cannot see it.
export interface PaymentAccountSummary {
  icon: string;
  id: string;
  name: string;
  status: AccountStatus;
}

interface ICreditCardEntity {
  brand: CreditCardBrand;
  closingDay: number;
  color: string;
  currency?: CurrencyCode;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: OwnerType;
  ownerId: string;
  paymentAccount?: null | PaymentAccountSummary;
  paymentAccountId?: string;
  paymentDay?: number;
  status: AccountStatus;
  title: string;
}

class CreditCardEntity implements ICreditCardEntity {
  brand: CreditCardBrand;
  closingDay: number;
  color: string;
  currency: CurrencyCode;
  dueDay: number;
  id: string;
  lastDigits?: string;
  limit: number;
  owner: OwnerType;
  ownerId: string;
  paymentAccount?: null | PaymentAccountSummary;
  paymentAccountId?: string;
  paymentDay?: number;
  status: AccountStatus;
  title: string;

  constructor(params: ICreditCardEntity) {
    this.brand = params.brand;
    this.closingDay = params.closingDay;
    this.color = params.color;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.dueDay = params.dueDay;
    this.id = params.id;
    this.lastDigits = params.lastDigits;
    this.limit = params.limit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.paymentAccount = params.paymentAccount;
    this.paymentAccountId = params.paymentAccountId;
    this.paymentDay = params.paymentDay;
    this.status = params.status;
    this.title = params.title;
  }
}

export default CreditCardEntity;
