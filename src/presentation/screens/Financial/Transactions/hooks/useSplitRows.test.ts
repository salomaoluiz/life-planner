import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";

import { invalidateAfterWrite } from "../pending/writeCache";
import useSplitRows from "./useSplitRows";

const mockOpenModal = jest.fn();

jest.mock("@application/useCases", () => ({
  useCases: { deleteFinancialSplitUseCase: { execute: jest.fn() } },
}));
jest.mock("../pending/writeCache", () => ({ invalidateAfterWrite: jest.fn() }));
jest.mock("@screens/Navigation/hooks/useModalNavigation", () => ({
  __esModule: true,
  default: () => ({ openModal: mockOpenModal }),
}));

const deleteSplit = jest.mocked(useCases.deleteFinancialSplitUseCase.execute);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD expand one split at a time AND collapse it on a second press", () => {
  const { result } = renderHook(() => useSplitRows());

  act(() => result.current.onToggle("s1"));
  expect(result.current.expandedId).toBe("s1");
  act(() => result.current.onToggle("s2"));
  expect(result.current.expandedId).toBe("s2");
  act(() => result.current.onToggle("s2"));
  expect(result.current.expandedId).toBeUndefined();
});

it("SHOULD open the split form of the whole group", () => {
  const { result } = renderHook(() => useSplitRows());

  act(() => result.current.onEdit("s1"));

  expect(mockOpenModal).toHaveBeenCalledWith("add_new_transaction", {
    splitId: "s1",
  });
});

it("SHOULD ask first AND delete the group once confirmed, refreshing the lists", async () => {
  deleteSplit.mockResolvedValue(undefined);
  const { result } = renderHook(() => useSplitRows());

  act(() => result.current.onDelete("s1"));
  expect(result.current.isDeleteOpen).toBe(true);
  expect(deleteSplit).not.toHaveBeenCalled();

  await act(async () => result.current.onDeleteConfirm());

  expect(deleteSplit).toHaveBeenCalledWith("s1");
  expect(invalidateAfterWrite).toHaveBeenCalledWith(
    expect.objectContaining({ listMonths: "all" }),
  );
  expect(result.current.isDeleteOpen).toBe(false);
});

it("SHOULD cancel without deleting AND keep the dialog open with the error WHEN the delete fails", async () => {
  deleteSplit.mockRejectedValue(new BusinessError());
  const { result } = renderHook(() => useSplitRows());

  act(() => result.current.onDelete("s1"));
  act(() => result.current.onDeleteCancel());
  expect(result.current.isDeleteOpen).toBe(false);
  await act(async () => result.current.onDeleteConfirm());
  expect(deleteSplit).not.toHaveBeenCalled();

  act(() => result.current.onDelete("s1"));
  await act(async () => result.current.onDeleteConfirm());

  expect(result.current.isDeleteOpen).toBe(true);
  expect(result.current.deleteErrorKey).toBeDefined();
  expect(result.current.isDeleting).toBe(false);
});
