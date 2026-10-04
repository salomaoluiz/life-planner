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
      type: "EXPENSE",
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
      type: "EXPENSE",
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

  describe("submitted values", () => {
    function submit(
      setupFields: (fields: ReturnType<typeof useForm>["fields"]) => void,
      ownersList = owners,
      categoriesList = categories,
    ) {
      const { result } = renderHook(() => useForm());
      act(() => {
        result.current.fields.name.onChange("Bonus");
        setupFields(result.current.fields);
      });
      let params: CreateCategoryUseCaseParams | undefined;
      act(() => {
        params = result.current.validateForm(ownersList, categoriesList);
      });
      return params;
    }

    it("SHOULD use the defaults and the first owner WHEN nothing else was chosen", () => {
      expect(submit(() => undefined)).toEqual({
        depthLevel: 0,
        icon: "folder",
        iconColor: "black",
        name: "Bonus",
        owner: OwnerType.USER,
        ownerId: "owner-1",
        parentId: undefined,
        type: "EXPENSE",
      });
    });

    it("SHOULD submit the type of the selected FAMILY owner", () => {
      const withFamily = [
        ...owners,
        new OwnerDTO({
          id: "owner-2",
          name: "Test Family",
          type: OwnerType.FAMILY,
        }),
      ];

      expect(
        submit((fields) => fields.ownerId.onChange("owner-2"), withFamily),
      ).toMatchObject({ owner: OwnerType.FAMILY, ownerId: "owner-2" });
    });

    it("SHOULD default to USER WHEN the selected owner is unknown", () => {
      expect(
        submit((fields) => fields.ownerId.onChange("missing")),
      ).toMatchObject({ owner: OwnerType.USER, ownerId: "missing" });
    });

    it("SHOULD default to USER WHEN there are no owners", () => {
      expect(submit(() => undefined, [])).toMatchObject({
        owner: OwnerType.USER,
        ownerId: undefined,
      });
    });

    it("SHOULD add one level to the parent depth", () => {
      const deep = [
        new CategoryDTO({
          depthLevel: 2,
          icon: "cash",
          id: "cat-deep",
          name: "Deep",
          owner: "USER",
          ownerId: "owner-1",
          type: "EXPENSE",
        }),
      ];

      expect(
        submit((fields) => fields.parentId.onChange("cat-deep"), owners, deep),
      ).toMatchObject({ depthLevel: 3, parentId: "cat-deep" });
    });

    it("SHOULD treat a parent without depth level as depth 0", () => {
      const noDepth = [
        new CategoryDTO({
          icon: "cash",
          id: "cat-flat",
          name: "Flat",
          owner: "USER",
          ownerId: "owner-1",
          type: "EXPENSE",
        }),
      ];

      expect(
        submit(
          (fields) => fields.parentId.onChange("cat-flat"),
          owners,
          noDepth,
        ),
      ).toMatchObject({ depthLevel: 1 });
    });

    it("SHOULD keep depth 0 WHEN the parent is not in the list", () => {
      expect(
        submit((fields) => fields.parentId.onChange("missing")),
      ).toMatchObject({ depthLevel: 0, parentId: "missing" });
    });

    it("SHOULD submit no parent WHEN the parent is the empty root option", () => {
      expect(submit((fields) => fields.parentId.onChange(""))).toMatchObject({
        depthLevel: 0,
        parentId: undefined,
      });
    });

    it("SHOULD submit the chosen type", () => {
      expect(submit((fields) => fields.type.onChange("INCOME"))).toMatchObject({
        type: "INCOME",
      });
    });

    it("SHOULD clear the name error WHEN a later submit is valid", () => {
      const { result } = renderHook(() => useForm());
      act(() => {
        result.current.validateForm(owners, categories);
      });
      expect(result.current.errors.name).toBe("Name is required");

      act(() => result.current.fields.name.onChange("Bonus"));
      act(() => {
        result.current.validateForm(owners, categories);
      });

      expect(result.current.errors).toEqual({});
    });
  });
});
