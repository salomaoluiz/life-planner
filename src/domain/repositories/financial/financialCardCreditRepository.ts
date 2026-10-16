// Refunds and early payments on a credit card (spec 032). Money in cents, dates `YYYY-MM-DD`, months `YYYY-MM`.
export type FinancialCardCreditRepository = {
  createEarlyPayment(params: CreateEarlyPaymentRepositoryParams): Promise<void>;
  createRefund(params: CreateRefundRepositoryParams): Promise<void>;
  deleteEarlyPayment(params: CardCreditRefRepositoryParams): Promise<void>;
  deleteRefund(params: CardCreditRefRepositoryParams): Promise<void>;
  updateEarlyPayment(params: UpdateEarlyPaymentRepositoryParams): Promise<void>;
  updateRefund(params: UpdateRefundRepositoryParams): Promise<void>;
};

interface CardCreditRefRepositoryParams {
  creditCardId: string;
  id: string;
}

interface CreateEarlyPaymentRepositoryParams {
  accountId?: string;
  creditCardId: string;
  date: string;
  description: string;
  invoiceMonth: string;
  method: "ACCOUNT" | "EXTERNAL";
  value: number;
}

interface CreateRefundRepositoryParams {
  creditCardId: string;
  date: string;
  description: string;
  invoiceMonth: string;
  refundedPlanId?: string;
  refundedTransactionId?: string;
  value: number;
}

interface UpdateEarlyPaymentRepositoryParams {
  accountId?: string;
  creditCardId: string;
  date?: string;
  description?: string;
  id: string;
  invoiceMonth?: string;
  method?: "ACCOUNT" | "EXTERNAL";
  value?: number;
}

interface UpdateRefundRepositoryParams {
  creditCardId: string;
  date?: string;
  description?: string;
  id: string;
  invoiceMonth?: string;
  // `null` removes the link.
  refundedPlanId?: null | string;
  refundedTransactionId?: null | string;
  value?: number;
}

export {
  CardCreditRefRepositoryParams,
  CreateEarlyPaymentRepositoryParams,
  CreateRefundRepositoryParams,
  UpdateEarlyPaymentRepositoryParams,
  UpdateRefundRepositoryParams,
};
