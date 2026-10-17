export interface EligibleInstallmentEntity {
  id: string;
  installmentNumber: number;
  // `YYYY-MM`
  invoiceMonth: string;
  // Cents.
  value: number;
}

// What a prepayment into one invoice would move (spec 032 FR 13); money in cents.
class PrepaymentPreviewEntity {
  eligible: EligibleInstallmentEntity[];
  total: number;

  constructor(params: {
    eligible: EligibleInstallmentEntity[];
    total: number;
  }) {
    this.eligible = params.eligible;
    this.total = params.total;
  }
}

export default PrepaymentPreviewEntity;
