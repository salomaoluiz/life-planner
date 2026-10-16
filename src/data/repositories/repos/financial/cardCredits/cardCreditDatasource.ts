export interface CardCreditDatasource {
  createEarlyPayment(params: CreateEarlyPaymentDatasourceParams): Promise<void>;
  createRefund(params: CreateRefundDatasourceParams): Promise<void>;
  deleteEarlyPayment(params: CardCreditRefParams): Promise<void>;
  deleteRefund(params: CardCreditRefParams): Promise<void>;
  updateEarlyPayment(params: UpdateEarlyPaymentDatasourceParams): Promise<void>;
  updateRefund(params: UpdateRefundDatasourceParams): Promise<void>;
}

// Money in cents, dates `YYYY-MM-DD`, months `YYYY-MM`.
interface CardCreditRefParams {
  creditCardId: string;
  id: string;
}

interface CreateEarlyPaymentDatasourceParams {
  accountId?: string;
  creditCardId: string;
  date: string;
  description: string;
  invoiceMonth: string;
  method: "ACCOUNT" | "EXTERNAL";
  value: number;
}

interface CreateRefundDatasourceParams {
  creditCardId: string;
  date: string;
  description: string;
  invoiceMonth: string;
  refundedPlanId?: string;
  refundedTransactionId?: string;
  value: number;
}

interface UpdateEarlyPaymentDatasourceParams {
  accountId?: string;
  creditCardId: string;
  date?: string;
  description?: string;
  id: string;
  invoiceMonth?: string;
  method?: "ACCOUNT" | "EXTERNAL";
  value?: number;
}

interface UpdateRefundDatasourceParams {
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
  CardCreditRefParams,
  CreateEarlyPaymentDatasourceParams,
  CreateRefundDatasourceParams,
  UpdateEarlyPaymentDatasourceParams,
  UpdateRefundDatasourceParams,
};
