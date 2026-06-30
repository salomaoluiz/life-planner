import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewAccountViewModel from "./NewAccountViewModel";

describe("NewAccountViewModel", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "owner-1", name: "Luiz", type: OwnerType.USER }),
    new OwnerDTO({
      id: "owner-2",
      name: "Luiz Family",
      type: OwnerType.FAMILY,
    }),
  ];

  it("should format owners and statuses for pickers", () => {
    const vm = new NewAccountViewModel(owners);
    expect(vm.accountOwners).toEqual([
      { label: "Personal - Luiz", value: "owner-1" },
      { label: "Family - Luiz Family", value: "owner-2" },
    ]);
    expect(vm.accountStatuses).toEqual([
      { label: "Active", value: "ACTIVE" },
      { label: "Archived", value: "ARCHIVED" },
    ]);
  });
});
