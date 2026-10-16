import CardInvoiceEntity from "@domain/entities/financial/CardInvoiceEntity";
import CreditCardEntity, {
  CreditCardBrand,
} from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import { InvoicePaymentMethod } from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialCreditCardRepository = {
  createCreditCard(
    params: CreateCreditCardRepositoryParams,
  ): Promise<CreditCardEntity>;
  deleteCreditCard(params: DeleteCreditCardRepositoryParams): Promise<void>;
  getCardInvoice(params: CardInvoiceKey): Promise<CardInvoiceEntity>;
  getCardInvoicesForMonth(params: {
    month: string;
    ownerIds: string[];
  }): Promise<CardInvoiceEntity[]>;
  getCreditCards(ownerIds: string[]): Promise<CreditCardEntity[]>;
  getCreditCardsOverview(ownerIds: string[]): Promise<CreditCardOverviewEntity>;
  payInvoice(params: PayInvoiceRepositoryParams): Promise<void>;
  undoInvoicePayment(params: CardInvoiceKey): Promise<void>;
  updateCreditCard(params: UpdateCreditCardRepositoryParams): Promise<void>;
};

interface CardInvoiceKey {
  creditCardId: string;
  // `YYYY-MM`
  month: string;
}

interface CreateCreditCardRepositoryParams {
  brand: CreditCardBrand;
  closingDay: number;
  color: string;
  dueDay: number;
  lastDigits?: string;
  limit: number;
  owner: OwnerType;
  ownerId: string;
  paymentDay?: number;
  title: string;
}

interface DeleteCreditCardRepositoryParams {
  id: string;
}

interface PayInvoiceRepositoryParams extends CardInvoiceKey {
  accountId?: string;
  method: InvoicePaymentMethod;
  // `YYYY-MM-DD`
  paidOn: string;
}

// `null` clears the optional fields on the API.
interface UpdateCreditCardRepositoryParams {
  brand?: CreditCardBrand;
  closingDay?: number;
  color?: string;
  dueDay?: number;
  id: string;
  lastDigits?: null | string;
  limit?: number;
  owner?: OwnerType;
  ownerId?: string;
  paymentDay?: null | number;
  status?: string;
  title?: string;
}

export {
  CardInvoiceKey,
  CreateCreditCardRepositoryParams,
  PayInvoiceRepositoryParams,
  UpdateCreditCardRepositoryParams,
};
