import type { InvoicePurchaseUIModel } from "@screens/Financial/Transactions/models/CardInvoiceUIModel";

import { toCalendarDate } from "./creditSheet";

// What the confirm-projected modal needs to prefill itself (spec 096 FR 17). Built here so the invoice modal and the
// transactions list send exactly the same params (fix-2 FR 4).
export interface ProjectedConfirmParams {
  [key: string]: string | undefined;
  creditCardId: string;
  date: string;
  description: string;
  id: string;
  recurring?: string;
  value: string;
}

function projectedConfirmParams(
  creditCardId: string,
  purchase: InvoicePurchaseUIModel,
): ProjectedConfirmParams {
  return {
    creditCardId,
    date: toCalendarDate(purchase.date),
    description: purchase.description,
    id: purchase.id,
    recurring: purchase.recurrenceId ? "1" : undefined,
    value: String(purchase.amountCents),
  };
}

export { projectedConfirmParams };
