import { act, renderHook } from "@testing-library/react-native";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateCategoryUseCaseParams } from "@application/useCases/cases/financial/categories/createCategoryUseCase";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useForm from "./useForm";

describe("useForm", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "owner-1", name: "Luiz", type: OwnerType.USER }),
  ];
  const categories: CategoryDTO[] = [
    new CategoryDTO({
      depthLevel: 0,
      icon: "cash",
      id: "cat-1",
      name: "Salary",
      owner: "USER",
      ownerId: "owner-1",
    }),
  ];

  it("should fail validation if name is empty", () => {
    const { result } = renderHook(() => useForm());
    let params;
    act(() => {
      params = result.current.validateForm(owners, categories);
    });
    expect(params).toBeUndefined();
    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should succeed and calculate correct depthLevel if parent is selected", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Bonus");
      result.current.fields.parentId.onChange("cat-1");
      result.current.fields.icon.onChange("star");
      result.current.fields.iconColor.onChange("#ff9f43");
    });
    let params;
    act(() => {
      params = result.current.validateForm(owners, categories);
    });
    expect(params).toEqual({
      depthLevel: 1,
      icon: "star",
      iconColor: "#ff9f43",
      name: "Bonus",
      owner: "USER",
      ownerId: "owner-1",
      parentId: "cat-1",
    });
  });

  it("should return parentId as undefined if it is empty string", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Salary");
      result.current.fields.parentId.onChange("");
    });
    let params: CreateCategoryUseCaseParams | undefined;
    act(() => {
      params = result.current.validateForm(owners, categories);
    });
    expect(params?.parentId).toBeUndefined();
    expect(params?.iconColor).toBe("black");
  });
});
