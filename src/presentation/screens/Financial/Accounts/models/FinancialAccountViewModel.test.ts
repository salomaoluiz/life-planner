import AccountDTO from "@application/dto/financial/AccountDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import FinancialAccountViewModel from "./FinancialAccountViewModel";

describe("FinancialAccountViewModel", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "owner-1", name: "Luiz", type: OwnerType.USER }),
  ];

  it("should correctly format properties and balance", () => {
    const dto = new AccountDTO({
      balance: 1500.5,
      icon: "bank",
      id: "acc-1",
      name: "Checking",
      owner: "USER",
      ownerId: "owner-1",
      status: "ACTIVE",
    });

    const vm = new FinancialAccountViewModel(dto, owners);
    expect(vm.id).toBe("acc-1");
    expect(vm.name).toBe("Checking");
    expect(vm.balance).toBe(1500.5);
    expect(vm.icon).toBe("bank");
    expect(vm.ownerId).toBe("owner-1");
    expect(vm.ownerName).toBe("Luiz (Personal)");
    expect(vm.status).toBe("ACTIVE");
    expect(vm.formattedBalance).toBe("$1,500.50");
  });

  it("SHOULD label the owner as Family WHEN the account belongs to a family", () => {
    const dto = new AccountDTO({
      balance: 0,
      icon: "bank",
      id: "acc-2",
      name: "Joint",
      owner: "FAMILY",
      ownerId: "owner-2",
      status: "ARCHIVED",
    });
    const familyOwners = [
      ...owners,
      new OwnerDTO({
        id: "owner-2",
        name: "Test Family",
        type: OwnerType.FAMILY,
      }),
    ];

    const vm = new FinancialAccountViewModel(dto, familyOwners);

    expect(vm.ownerName).toBe("Test Family (Family)");
    expect(vm.owner).toBe("FAMILY");
    expect(vm.status).toBe("ARCHIVED");
    expect(vm.formattedBalance).toBe("$0.00");
  });

  it.each([
    ["USER", "Personal"],
    ["FAMILY", "Family"],
  ])(
    "SHOULD only show the type WHEN the %s owner is unknown",
    (owner, label) => {
      const dto = new AccountDTO({
        balance: 1,
        icon: "bank",
        id: "acc-3",
        name: "Orphan",
        owner,
        ownerId: "missing",
        status: "ACTIVE",
      });

      expect(new FinancialAccountViewModel(dto, owners).ownerName).toBe(label);
    },
  );
});
