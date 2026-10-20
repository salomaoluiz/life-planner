import BusinessError from "@domain/entities/errors/common/BusinessError";

export interface FamilyBlockers {
  installmentPlans: {
    description: string;
    id: string;
    remainingInstallments: number;
  }[];
  invoices: {
    amountDue: number;
    creditCardId: string;
    creditCardName: string;
    month: string;
  }[];
  pendingInvites: { email: string; id: string }[];
  recurrences: {
    description: string;
    id: string;
    nextOccurrenceDate: null | string;
  }[];
  unpaidTransactions: {
    date: string;
    description: string;
    id: string;
    value: number;
  }[];
}

// The API answers 409 when archiving a family that still has recurrences, plans, unpaid invoices or
// transactions, or pending invites (spec 042). `blockers` lists them (capped), money in cents.
class FamilyHasPendingItems extends BusinessError {
  blockers: FamilyBlockers;

  constructor(blockers: Partial<FamilyBlockers>) {
    super();
    this.name = "FamilyHasPendingItems";
    this.blockers = {
      installmentPlans: blockers.installmentPlans ?? [],
      invoices: blockers.invoices ?? [],
      pendingInvites: blockers.pendingInvites ?? [],
      recurrences: blockers.recurrences ?? [],
      unpaidTransactions: blockers.unpaidTransactions ?? [],
    };
  }
}

export default FamilyHasPendingItems;
