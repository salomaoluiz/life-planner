import CardInvoiceModel from "@data/models/financial/CardInvoiceModel";
import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { InvoicePaymentMethod } from "@domain/entities/financial/InvoiceEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface CreditCardDatasource {
  createCreditCard(
    params: CreateCreditCardDatasourceParams,
  ): Promise<CreditCardModel>;
  deleteCreditCard(params: DeleteCreditCardDatasourceParams): Promise<void>;
  getCardInvoice(
    params: GetCardInvoiceDatasourceParams,
  ): Promise<CardInvoiceModel>;
  getCardInvoicesForMonth(
    params: GetCardInvoicesForMonthDatasourceParams,
  ): Promise<CardInvoiceModel[]>;
  getCreditCards(ownerIds: string[]): Promise<CreditCardModel[]>;
  getCreditCardsOverview(ownerIds: string[]): Promise<CreditCardOverviewModel>;
  payInvoice(params: PayInvoiceDatasourceParams): Promise<void>;
  undoInvoicePayment(params: GetCardInvoiceDatasourceParams): Promise<void>;
  updateCreditCard(params: UpdateCreditCardDatasourceParams): Promise<void>;
}

interface CreateCreditCardDatasourceParams {
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

interface DeleteCreditCardDatasourceParams {
  id: string;
}

interface GetCardInvoiceDatasourceParams {
  creditCardId: string;
  // `YYYY-MM`
  month: string;
}

interface GetCardInvoicesForMonthDatasourceParams {
  // `YYYY-MM`
  month: string;
  ownerIds: string[];
}

interface PayInvoiceDatasourceParams extends GetCardInvoiceDatasourceParams {
  accountId?: string;
  method: InvoicePaymentMethod;
  // `YYYY-MM-DD`
  paidOn: string;
}

interface UpdateCreditCardDatasourceParams {
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
  CreateCreditCardDatasourceParams,
  GetCardInvoiceDatasourceParams,
  GetCardInvoicesForMonthDatasourceParams,
  PayInvoiceDatasourceParams,
  UpdateCreditCardDatasourceParams,
};
