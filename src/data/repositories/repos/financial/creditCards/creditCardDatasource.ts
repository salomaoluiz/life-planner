import CreditCardModel from "@data/models/financial/CreditCardModel";
import CreditCardOverviewModel from "@data/models/financial/CreditCardOverviewModel";
import { CreditCardBrand } from "@domain/entities/financial/CreditCardEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export interface CreditCardDatasource {
  createCreditCard(
    params: CreateCreditCardDatasourceParams,
  ): Promise<CreditCardModel>;
  deleteCreditCard(params: DeleteCreditCardDatasourceParams): Promise<void>;
  getCreditCards(ownerIds: string[]): Promise<CreditCardModel[]>;
  getCreditCardsOverview(ownerIds: string[]): Promise<CreditCardOverviewModel>;
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

export { CreateCreditCardDatasourceParams, UpdateCreditCardDatasourceParams };
