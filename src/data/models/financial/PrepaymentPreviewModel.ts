export interface EligibleInstallmentModel {
  id: string;
  installmentNumber: number;
  // `YYYY-MM`
  invoiceMonth: string;
  // Cents.
  value: number;
}

// API shape of `GET /v1/finance/installment-plans/:id/prepayment-preview` (cents).
class PrepaymentPreviewModel {
  eligible: EligibleInstallmentModel[];
  total: number;

  constructor(params: { eligible: EligibleInstallmentModel[]; total: number }) {
    this.eligible = params.eligible;
    this.total = params.total;
  }

  static fromJSON(data: Record<string, unknown>): PrepaymentPreviewModel {
    const eligible = (data.eligible ?? []) as Record<string, unknown>[];

    return new PrepaymentPreviewModel({
      eligible: eligible.map((row) => ({
        id: row.id as string,
        installmentNumber: Number(row.installmentNumber),
        invoiceMonth: row.invoiceMonth as string,
        value: Number(row.value),
      })),
      total: Number(data.total),
    });
  }
}

export default PrepaymentPreviewModel;
