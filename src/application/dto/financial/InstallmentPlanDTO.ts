import {
  CurrencyCode,
  DEFAULT_CURRENCY,
} from "@domain/entities/financial/Currency";
import InstallmentPlanEntity, {
  InstallmentEntity,
  PrepaymentEntity,
} from "@domain/entities/financial/InstallmentPlanEntity";

class InstallmentPlanDTO {
  categoryId: string;
  creditCardId: string;
  currency: CurrencyCode;
  date: string;
  description: string;
  id: string;
  installmentCount: number;
  installments: InstallmentEntity[];
  overLimit?: boolean;
  owner: string;
  ownerId: string;
  prepayment?: PrepaymentEntity;
  totalValue: string;

  constructor(params: {
    categoryId: string;
    creditCardId: string;
    currency?: CurrencyCode;
    date: string;
    description: string;
    id: string;
    installmentCount: number;
    installments: InstallmentEntity[];
    overLimit?: boolean;
    owner: string;
    ownerId: string;
    prepayment?: PrepaymentEntity;
    totalValue: string;
  }) {
    this.categoryId = params.categoryId;
    this.creditCardId = params.creditCardId;
    this.currency = params.currency ?? DEFAULT_CURRENCY;
    this.date = params.date;
    this.description = params.description;
    this.id = params.id;
    this.installmentCount = params.installmentCount;
    this.installments = params.installments;
    this.overLimit = params.overLimit;
    this.owner = params.owner;
    this.ownerId = params.ownerId;
    this.prepayment = params.prepayment;
    this.totalValue = params.totalValue;
  }

  static fromEntity(entity: InstallmentPlanEntity) {
    return new InstallmentPlanDTO({
      categoryId: entity.categoryId,
      creditCardId: entity.creditCardId,
      currency: entity.currency,
      date: entity.date,
      description: entity.description,
      id: entity.id,
      installmentCount: entity.installmentCount,
      installments: entity.installments.map((row) => ({ ...row })),
      overLimit: entity.overLimit,
      owner: entity.owner,
      ownerId: entity.ownerId,
      prepayment: entity.prepayment ? { ...entity.prepayment } : undefined,
      totalValue: entity.totalValue,
    });
  }
}

export default InstallmentPlanDTO;
