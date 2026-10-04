import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";

class NewAccountViewModel {
  get accountOwners() {
    return this.owners.map((owner) => ({
      label: `${owner.type === "FAMILY" ? "Family" : "Personal"} - ${owner.name}`,
      value: owner.id,
    }));
  }

  get accountStatuses() {
    return [
      { label: "Active", value: AccountStatus.ACTIVE },
      { label: "Archived", value: AccountStatus.ARCHIVED },
    ];
  }

  constructor(private readonly owners: OwnerDTO[]) {}
}

export default NewAccountViewModel;
