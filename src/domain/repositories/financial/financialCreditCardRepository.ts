import CreditCardEntity, {
  CreditCardBrand,
} from "@domain/entities/financial/CreditCardEntity";
import CreditCardOverviewEntity from "@domain/entities/financial/CreditCardOverviewEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

export type FinancialCreditCardRepository = {
  createCreditCard(
    params: CreateCreditCardRepositoryParams,
  ): Promise<CreditCardEntity>;
  deleteCreditCard(params: DeleteCreditCardRepositoryParams): Promise<void>;
  getCreditCards(ownerIds: string[]): Promise<CreditCardEntity[]>;
  getCreditCardsOverview(ownerIds: string[]): Promise<CreditCardOverviewEntity>;
  updateCreditCard(params: UpdateCreditCardRepositoryParams): Promise<void>;
};

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

export { CreateCreditCardRepositoryParams, UpdateCreditCardRepositoryParams };
