import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { decimalToCents } from "@utils/money";

class AccountUIModel {
  get balanceAmount(): { type?: "EXPENSE"; value: number } {
    const cents = this.balanceCents;

    if (cents < 0) {
      return { type: "EXPENSE", value: Math.abs(cents) };
    }

    return { value: cents };
  }

  get balanceCents() {
    return decimalToCents(this.dto.balance);
  }

  get icon() {
    return this.dto.icon;
  }

  get id() {
    return this.dto.id;
  }

  get isArchived() {
    return this.dto.status === "ARCHIVED";
  }

  get name() {
    return this.dto.name;
  }

  get ownerId() {
    return this.dto.ownerId;
  }

  get ownerName() {
    return (
      this.owners.find((owner) => owner.id === this.dto.ownerId)?.name ?? ""
    );
  }

  constructor(
    private readonly dto: AccountDTO,
    private readonly owners: OwnerDTO[],
  ) {}
}

export default AccountUIModel;
