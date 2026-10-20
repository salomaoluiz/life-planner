import { act, renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useReadOnlyScope from "./useReadOnlyScope";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Test", type: OwnerType.USER }),
  new OwnerDTO({
    archived: true,
    id: "old-family",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];

it("SHOULD not be read-only for All or an active owner", () => {
  expect(
    renderHook(() => useReadOnlyScope(owners, "ALL")).result.current.readOnly,
  ).toBe(false);
  expect(
    renderHook(() => useReadOnlyScope(owners, "user-id")).result.current
      .readOnly,
  ).toBe(false);
  expect(
    renderHook(() => useReadOnlyScope(undefined, "old-family")).result.current
      .readOnly,
  ).toBe(false);
});

it("SHOULD run the action when writable", () => {
  const action = jest.fn();
  const { result } = renderHook(() => useReadOnlyScope(owners, "user-id"));

  act(() => result.current.guard(action)("a"));

  expect(action).toHaveBeenCalledWith("a");
  expect(result.current.toastVisible).toBe(false);
});

it("SHOULD show the toast instead of running the action WHEN the archived family is selected", () => {
  const action = jest.fn();
  const { result } = renderHook(() => useReadOnlyScope(owners, "old-family"));

  expect(result.current.readOnly).toBe(true);
  act(() => result.current.guard(action)());

  expect(action).not.toHaveBeenCalled();
  expect(result.current.toastVisible).toBe(true);

  act(() => result.current.onToastHide());
  expect(result.current.toastVisible).toBe(false);

  act(() => result.current.notifyReadOnly());
  expect(result.current.toastVisible).toBe(true);

  act(() => result.current.onToastHide());

  expect(result.current.toastVisible).toBe(false);
});
