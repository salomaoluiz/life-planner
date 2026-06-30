import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

class FinancialAccountViewModel {
  get balance() {
    return this.dto.balance;
  }

  get formattedBalance() {
    return new Intl.NumberFormat("en-US", {
      currency: "USD",
      style: "currency",
    }).format(this.dto.balance);
  }

  get icon() {
    return this.dto.icon;
  }

  get id() {
    return this.dto.id;
  }

  get name() {
    return this.dto.name;
  }

  get owner() {
    return this.dto.owner;
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get ownerName() {
    const owner = this.owners.find((o) => o.id === this.dto.ownerId);
    const typeLabel = this.dto.owner === "FAMILY" ? "Family" : "Personal";
    return owner ? `${owner.name} (${typeLabel})` : typeLabel;
  }

  get status() {
    return this.dto.status;
  }

  constructor(
    private readonly dto: AccountDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export default FinancialAccountViewModel;
