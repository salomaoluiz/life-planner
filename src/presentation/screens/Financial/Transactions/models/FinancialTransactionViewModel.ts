import TransactionDTO from "@application/dto/financial/TransactionDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { captureMessage } from "@infrastructure/monitoring";

class FinancialTransactionViewModel {
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
    return `${this.dto.value}`;
  }

  private readonly dto: TransactionDTO;

  private readonly ownerDTOs: OwnerDTO[];

  constructor(dto: TransactionDTO, ownerDTOs: OwnerDTO[]) {
    this.dto = dto;
    this.ownerDTOs = ownerDTOs;
  }
}

export default FinancialTransactionViewModel;
