import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import FinancialCategoryViewModel from "./FinancialCategoryViewModel";

describe("FinancialCategoryViewModel", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "1", name: "Luiz", type: OwnerType.USER }),
    new OwnerDTO({ id: "2", name: "Family Hub", type: OwnerType.FAMILY }),
  ];

  it("should format owner name correctly", () => {
    const dto = new CategoryDTO({
      icon: "food",
      id: "cat-1",
      name: "Food",
      owner: "USER",
      ownerId: "1",
      type: "EXPENSE",
    });
    const vm = new FinancialCategoryViewModel(dto, owners);
    expect(vm.ownerName).toBe("Luiz (Personal)");
  });

  it("should sort category list hierarchy with preorder traversal", () => {
    const parentDto = new CategoryDTO({
      depthLevel: 0,
      icon: "car",
      id: "parent",
      name: "Transport",
      owner: "USER",
      ownerId: "1",
      type: "EXPENSE",
    });
    const childDto = new CategoryDTO({
      depthLevel: 1,
      icon: "car",
      id: "child",
      name: "Uber",
      owner: "USER",
      ownerId: "1",
      parentId: "parent",
      type: "EXPENSE",
    });
    const unrelatedDto = new CategoryDTO({
      depthLevel: 0,
      icon: "food",
      id: "unrelated",
      name: "Food",
      owner: "USER",
      ownerId: "1",
      type: "EXPENSE",
    });

    const vms = [
      new FinancialCategoryViewModel(parentDto, owners),
      new FinancialCategoryViewModel(childDto, owners),
      new FinancialCategoryViewModel(unrelatedDto, owners),
    ];

    const sorted = FinancialCategoryViewModel.buildHierarchy(vms);
    expect(sorted.map((s) => s.id)).toEqual(["parent", "child", "unrelated"]);
  });

  it("SHOULD expose the plain category fields", () => {
    const vm = new FinancialCategoryViewModel(
      new CategoryDTO({
        depthLevel: 2,
        icon: "food",
        id: "cat-1",
        name: "Food",
        owner: "USER",
        ownerId: "1",
        parentId: "cat-0",
        type: "INCOME",
      }),
      owners,
    );

    expect(vm.id).toBe("cat-1");
    expect(vm.name).toBe("Food");
    expect(vm.icon).toBe("food");
    expect(vm.ownerId).toBe("1");
    expect(vm.parentId).toBe("cat-0");
    expect(vm.type).toBe("INCOME");
    expect(vm.depthLevel).toBe(2);
  });

  it("SHOULD default the depth level to 0 WHEN the category has none", () => {
    const vm = new FinancialCategoryViewModel(
      new CategoryDTO({
        icon: "food",
        id: "cat-1",
        name: "Food",
        owner: "USER",
        ownerId: "1",
        type: "EXPENSE",
      }),
      owners,
    );

    expect(vm.depthLevel).toBe(0);
  });

  it("SHOULD label the owner as Family WHEN the category belongs to a family", () => {
    const vm = new FinancialCategoryViewModel(
      new CategoryDTO({
        icon: "home",
        id: "cat-2",
        name: "Rent",
        owner: "FAMILY",
        ownerId: "2",
        type: "EXPENSE",
      }),
      owners,
    );

    expect(vm.ownerName).toBe("Family Hub (Family)");
  });

  it.each([
    ["USER", "Personal"],
    ["FAMILY", "Family"],
  ])(
    "SHOULD only show the type WHEN the %s owner is unknown",
    (owner, label) => {
      const vm = new FinancialCategoryViewModel(
        new CategoryDTO({
          icon: "home",
          id: "cat-3",
          name: "Orphan",
          owner,
          ownerId: "missing",
          type: "EXPENSE",
        }),
        owners,
      );

      expect(vm.ownerName).toBe(label);
    },
  );

  it("SHOULD append categories whose parent is missing at the end of the hierarchy", () => {
    const root = new FinancialCategoryViewModel(
      new CategoryDTO({
        icon: "car",
        id: "root",
        name: "Transport",
        owner: "USER",
        ownerId: "1",
        type: "EXPENSE",
      }),
      owners,
    );
    const orphan = new FinancialCategoryViewModel(
      new CategoryDTO({
        icon: "car",
        id: "orphan",
        name: "Lost",
        owner: "USER",
        ownerId: "1",
        parentId: "not-here",
        type: "EXPENSE",
      }),
      owners,
    );

    const result = FinancialCategoryViewModel.buildHierarchy([orphan, root]);

    expect(result.map((c) => c.id)).toEqual(["root", "orphan"]);
  });

  it("SHOULD return an empty hierarchy WHEN there are no categories", () => {
    expect(FinancialCategoryViewModel.buildHierarchy([])).toEqual([]);
  });
});
