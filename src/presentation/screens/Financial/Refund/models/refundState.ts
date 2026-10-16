import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { TranslationKeys } from "@presentation/i18n/types";

interface LinkedOption {
  isPlan: boolean;
  name: string;
  value: LinkedValue;
}

// `tx:<id>` for a card purchase, `plan:<id>` for an installment plan; the refund points at exactly one of them.
type LinkedValue = string;

interface RefundErrors {
  amount?: TranslationKeys;
  description?: TranslationKeys;
  invoice?: TranslationKeys;
}

// Only the sheet's own state: `description` stays undefined until the user types, so the default can follow the linked purchase.
interface RefundState {
  amountCents: number;
  date: Date;
  description?: string;
  invoiceMonth?: string;
  linked?: LinkedValue;
}

// The API body fields for a new refund.
function createLinkFields(linked: LinkedValue | undefined) {
  return {
    refundedPlanId: linked?.startsWith("plan:") ? linked.slice(5) : undefined,
    refundedTransactionId: linked?.startsWith("tx:")
      ? linked.slice(3)
      : undefined,
  };
}

function linkedFromParams(params: {
  refundedPlanId?: string;
  refundedTransactionId?: string;
}): LinkedValue | undefined {
  if (params.refundedPlanId) {
    return `plan:${params.refundedPlanId}`;
  }

  return params.refundedTransactionId
    ? `tx:${params.refundedTransactionId}`
    : undefined;
}

function linkedOptions(
  transactions: TransactionDTO[],
  creditCardId: string,
): LinkedOption[] {
  const seenPlans = new Set<string>();
  const options: LinkedOption[] = [];
  const rows = transactions
    .filter(
      (transaction) =>
        transaction.creditCardId === creditCardId &&
        transaction.type === "EXPENSE" &&
        !transaction.systemKey,
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  for (const row of rows) {
    if (row.installmentPlanId) {
      if (!seenPlans.has(row.installmentPlanId)) {
        seenPlans.add(row.installmentPlanId);
        options.push({
          isPlan: true,
          name: row.description,
          value: `plan:${row.installmentPlanId}`,
        });
      }
    } else {
      options.push({
        isPlan: false,
        name: row.description,
        value: `tx:${row.id}`,
      });
    }
  }

  return options;
}

// Credit that stays on the invoice (and moves to the next one) once the refund is saved; 0 when the invoice still owes money.
// While editing, the invoice total already includes the refund being edited.
function refundCarry(
  invoiceTotalCents: number,
  valueCents: number,
  originalCents = 0,
) {
  return Math.max(0, valueCents - (invoiceTotalCents + originalCents));
}

// The API body fields when editing: `null` removes a link.
function updateLinkFields(linked: LinkedValue | undefined) {
  return {
    refundedPlanId: linked?.startsWith("plan:") ? linked.slice(5) : null,
    refundedTransactionId: linked?.startsWith("tx:") ? linked.slice(3) : null,
  };
}

function validate(state: RefundState, description: string): RefundErrors {
  const errors: RefundErrors = {};

  if (state.amountCents < 1) {
    errors.amount = "financial.refund.errors.amount";
  }

  if (description.trim().length === 0) {
    errors.description = "financial.refund.errors.description";
  }

  if (!state.invoiceMonth) {
    errors.invoice = "financial.refund.errors.invoice";
  }

  return errors;
}

export type { LinkedOption, LinkedValue, RefundErrors, RefundState };
export {
  createLinkFields,
  linkedFromParams,
  linkedOptions,
  refundCarry,
  updateLinkFields,
  validate,
};
