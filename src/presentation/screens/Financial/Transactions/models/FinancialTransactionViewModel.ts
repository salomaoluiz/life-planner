import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { captureMessage } from "@infrastructure/monitoring";

export enum SortRule {
  DATE_ASC = "DATE_ASC",
}
class FinancialTransactionViewModel {
  get category() {
    return this.dto.category;
  }

  get description() {
    return this.dto.description;
  }

  get ids() {
    return {
      ownerId: this.dto.ownerId,
      transactionId: this.dto.id,
    };
  }

  get isExpense() {
    return this.dto.type === "EXPENSE";
  }

  get owner() {
    const ownerName = this.ownerDTOs.find(
      (owner) => owner.id === this.dto.ownerId,
    )?.name;

    const ownerType = this.dto.owner === "FAMILY" ? "Family" : "Personal";

    return `${ownerName} (${ownerType})`;
  }

  get transactionDate() {
    return new Date(this.dto.date).toLocaleDateString();
  }

  get type() {
    switch (this.dto.type) {
      case "EXPENSE":
        return "Expense";
      case "INCOME":
        return "Income";
      default:
        captureMessage("Invalid Transaction Type, showing as Unknown", {
          dto: this.dto,
        });
        return "Unknown";
    }
  }

  get value() {
    return `R$ ${this.dto.value}`;
  }

  private readonly dto: TransactionDTO;

  private readonly ownerDTOs: OwnerDTO[];

  constructor(dto: TransactionDTO, ownerDTOs: OwnerDTO[]) {
    this.dto = dto;
    this.ownerDTOs = ownerDTOs;
  }

  static sort(transactions: FinancialTransactionViewModel[], rule: SortRule) {
    switch (rule) {
      case SortRule.DATE_ASC:
        return transactions.sort((a, b) => {
          const dateA = new Date(a.dto.date);
          const dateB = new Date(b.dto.date);
          return dateA.getTime() - dateB.getTime();
        });
      default:
        throw new Error("Invalid sort rule");
    }
  }
}

export default FinancialTransactionViewModel;
