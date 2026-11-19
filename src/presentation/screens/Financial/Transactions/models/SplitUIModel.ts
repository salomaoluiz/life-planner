import { decimalStringToCents } from "@utils/money";

import TransactionUIModel from "./TransactionUIModel";

const ADJUSTMENT_KEY = "SPLIT_ADJUSTMENT";

// One part of a split as the expanded row shows it (spec 119 FR 39).
export interface SplitPartView {
  amountCents: number;
  categoryColor?: string;
  categoryName: string;
  // Grey line: the own description, or the one of the split when the part has none.
  description: string;
  id: string;
  inherited: boolean;
  isAdjustment: boolean;
  isExpense: boolean;
  tags: string[];
}

// Spec 119 FR 39-40: the part rows of one split, grouped into ONE list entry. With a filter only the matching parts are
// here (`matchedCount` of `partCount`), the amount is the matching share and `total` is the whole split.
class SplitUIModel {
  get accountName() {
    return this.first.accountName;
  }

  get currency() {
    return this.first.currency;
  }

  get date() {
    return this.first.date;
  }

  get dateKey() {
    return this.first.dateKey;
  }

  get description() {
    return this.ref?.description ?? this.first.description;
  }

  // The net of the rows shown, as an expense or an income.
  get isExpense() {
    return this.signedCents <= 0;
  }

  // Parts that match a filter are fewer than the split has.
  get isFiltered() {
    return !!this.ref && this.matchedCount < this.partCount;
  }

  get isPaid() {
    return this.ref?.paid ?? this.parts.every((part) => part.isPaid);
  }

  get isProjected() {
    return false;
  }

  get matchedCount() {
    return this.parts.length;
  }

  get notes() {
    return this.ref?.notes;
  }

  get othersCents() {
    return Math.max(0, this.totalCents - Math.abs(this.signedCents));
  }

  get othersCount() {
    return Math.max(0, this.partCount - this.matchedCount);
  }

  get ownerId() {
    return this.first.ownerId;
  }

  get partCount() {
    return this.ref?.partCount ?? this.parts.length;
  }

  // In the order the user wrote them (the list order inside a split is not).
  get partViews(): SplitPartView[] {
    return [...this.parts]
      .sort((a, b) => (a.dto.splitPosition ?? 0) - (b.dto.splitPosition ?? 0))
      .map((part) => {
        const isAdjustment = part.dto.systemKey === ADJUSTMENT_KEY;

        return {
          // As stored: negative only for a discount.
          amountCents: part.amountCents,
          categoryColor: part.categoryColor,
          categoryName: part.categoryName,
          description: part.description,
          id: part.id,
          inherited: part.dto.descriptionInherited,
          isAdjustment,
          isExpense: part.isExpense,
          tags: part.dto.tags.map((tag) => tag.name),
        };
      });
  }

  get recurrenceId() {
    return this.ref?.recurrenceId;
  }

  // Signed cents of the rows shown: income positive, expense negative (the adjustment keeps its sign).
  get signedCents() {
    return this.parts.reduce((sum, part) => sum + part.signedCents, 0);
  }

  get totalCents() {
    return this.ref
      ? decimalStringToCents(this.ref.total)
      : Math.abs(this.signedCents);
  }

  private get first() {
    return this.parts[0];
  }

  private get ref() {
    return this.first.dto.split;
  }

  constructor(
    readonly id: string,
    readonly parts: TransactionUIModel[],
  ) {}
}

export default SplitUIModel;
