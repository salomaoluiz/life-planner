import { act, renderHook } from "@testing-library/react-native";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { AccountStatus } from "@domain/entities/financial/AccountEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useForm from "./useForm";

describe("useForm for Financial Accounts", () => {
  const owners: OwnerDTO[] = [
    new OwnerDTO({ id: "owner-1", name: "Luiz", type: OwnerType.USER }),
  ];

  it("should fail validation if fields are empty", () => {
    const { result } = renderHook(() => useForm());
    let params;
    act(() => {
      params = result.current.validateForm(owners);
    });
    expect(params).toBeUndefined();
    expect(result.current.errors.name).toBe("Name is required");
  });

  it("should fail validation if balance is not a number", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Checking Account");
      result.current.fields.balance.onChange("abc");
    });
    let params;
    act(() => {
      params = result.current.validateForm(owners);
    });
    expect(params).toBeUndefined();
    expect(result.current.errors.balance).toBe(
      "Balance must be a valid number",
    );
  });

  it("should succeed with valid values", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Checking Account");
      result.current.fields.balance.onChange("100.50");
      result.current.fields.icon.onChange("bank");
    });
    let params;
    act(() => {
      params = result.current.validateForm(owners);
    });
    expect(params).toEqual({
      balance: 100.5,
      icon: "bank",
      id: undefined,
      name: "Checking Account",
      owner: "USER",
      ownerId: "owner-1",
      status: "ACTIVE",
    });
  });

  it("should initialize with initialValues when provided", () => {
    const initialValues = {
      balance: "5000",
      icon: "cash",
      id: "acc-1",
      name: "Savings",
      ownerId: "owner-1",
      status: AccountStatus.ARCHIVED,
    };
    const { result } = renderHook(() => useForm({ initialValues }));
    expect(result.current.fields.name.value).toBe("Savings");
    expect(result.current.fields.balance.value).toBe("5000");
    expect(result.current.fields.ownerId.value).toBe("owner-1");
    expect(result.current.fields.icon.value).toBe("cash");
    expect(result.current.fields.status.value).toBe("ARCHIVED");
  });

  it("SHOULD fail validation WHEN the balance is blank", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Checking");
      result.current.fields.balance.onChange("   ");
    });
    let params;
    act(() => {
      params = result.current.validateForm(owners);
    });

    expect(params).toBeUndefined();
    expect(result.current.errors.balance).toBe("Balance is required");
  });

  it("SHOULD report both the name and balance errors at once", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.balance.onChange("");
    });
    act(() => {
      result.current.validateForm(owners);
    });

    expect(result.current.errors).toEqual({
      balance: "Balance is required",
      name: "Name is required",
    });
  });

  it.each([
    ["owner-1", OwnerType.USER],
    ["owner-2", OwnerType.FAMILY],
  ])("SHOULD submit the type of the selected owner %s", (ownerId, type) => {
    const familyOwners = [
      ...owners,
      new OwnerDTO({
        id: "owner-2",
        name: "Test Family",
        type: OwnerType.FAMILY,
      }),
    ];
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Checking");
      result.current.fields.ownerId.onChange(ownerId);
    });
    let params: ReturnType<typeof result.current.validateForm>;
    act(() => {
      params = result.current.validateForm(familyOwners);
    });

    expect(params).toMatchObject({ owner: type, ownerId });
  });

  it("SHOULD default to the USER type WHEN the selected owner is unknown", () => {
    const { result } = renderHook(() => useForm());
    act(() => {
      result.current.fields.name.onChange("Checking");
      result.current.fields.ownerId.onChange("missing");
    });
    let params: ReturnType<typeof result.current.validateForm>;
    act(() => {
      params = result.current.validateForm(owners);
    });

    expect(params).toMatchObject({ owner: OwnerType.USER, ownerId: "missing" });
  });

  it("SHOULD keep the id of the edited account in the submitted values", () => {
    const { result } = renderHook(() =>
      useForm({ initialValues: { id: "acc-9", name: "Savings" } }),
    );
    let params: ReturnType<typeof result.current.validateForm>;
    act(() => {
      params = result.current.validateForm(owners);
    });

    expect(params).toMatchObject({ id: "acc-9", name: "Savings" });
  });
});
