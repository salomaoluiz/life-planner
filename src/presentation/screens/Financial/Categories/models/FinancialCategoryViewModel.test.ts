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
});
