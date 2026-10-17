import PrepaymentPreviewEntity, {
  EligibleInstallmentEntity,
} from "@domain/entities/financial/PrepaymentPreviewEntity";

class PrepaymentPreviewDTO {
  eligible: EligibleInstallmentEntity[];
  total: number;

  constructor(params: {
    eligible: EligibleInstallmentEntity[];
    total: number;
  }) {
    this.eligible = params.eligible;
    this.total = params.total;
  }

  static fromEntity(entity: PrepaymentPreviewEntity) {
    return new PrepaymentPreviewDTO({
      eligible: entity.eligible.map((row) => ({ ...row })),
      total: entity.total,
    });
  }
}

export default PrepaymentPreviewDTO;
