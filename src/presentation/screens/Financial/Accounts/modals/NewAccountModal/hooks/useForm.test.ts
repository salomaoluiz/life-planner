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
});
