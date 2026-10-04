import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import NewCategoryViewModel from "./NewCategoryViewModel";

describe("NewCategoryViewModel", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "1", name: "Luiz", type: OwnerType.USER }),
    new OwnerDTO({ id: "2", name: "Family Hub", type: OwnerType.FAMILY }),
  ];
  const categories: CategoryDTO[] = [
    new CategoryDTO({
      icon: "food",
      id: "cat-1",
      name: "Food",
      owner: "USER",
      ownerId: "1",
      type: "EXPENSE",
    }),
    new CategoryDTO({
      icon: "cart",
      id: "cat-2",
      name: "Groceries",
      owner: "FAMILY",
      ownerId: "2",
      type: "EXPENSE",
    }),
  ];

  it("should get owners formatted for picker", () => {
    const vm = new NewCategoryViewModel(owners, categories);
    expect(vm.stockOwners).toEqual([
      { label: "USER - Luiz", value: "1" },
      { label: "FAMILY - Family Hub", value: "2" },
    ]);
  });

  it("should get parent categories filtered by owner", () => {
    const vm = new NewCategoryViewModel(owners, categories);
    const parentOpts = vm.getParentCategories("1", "EXPENSE");
    expect(parentOpts).toEqual([
      { label: "None (Root Category)", value: "" },
      { label: "Food", value: "cat-1" },
    ]);
  });

  it("SHOULD use the first owner WHEN no owner id is given", () => {
    const vm = new NewCategoryViewModel(owners, categories);

    expect(vm.getParentCategories(undefined, "EXPENSE")).toEqual([
      { label: "None (Root Category)", value: "" },
      { label: "Food", value: "cat-1" },
    ]);
  });

  it("SHOULD only offer the root option WHEN no category matches the owner and type", () => {
    const vm = new NewCategoryViewModel(owners, categories);

    expect(vm.getParentCategories("1", "INCOME")).toEqual([
      { label: "None (Root Category)", value: "" },
    ]);
  });

  it("SHOULD only offer the root option WHEN there are no owners", () => {
    const vm = new NewCategoryViewModel([], categories);

    expect(vm.getParentCategories(undefined, "EXPENSE")).toEqual([
      { label: "None (Root Category)", value: "" },
    ]);
  });
});
