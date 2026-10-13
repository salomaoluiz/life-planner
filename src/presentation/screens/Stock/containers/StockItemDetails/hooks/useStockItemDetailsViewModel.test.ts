import { act, renderHook } from "@testing-library/react-native";

import StockDTO from "@application/dto/stock/StockDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

import useStockItemDetailsViewModel from "./useStockItemDetailsViewModel";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteStockItemUseCase: { execute: jest.fn(), uniqueName: "delete_stock" },
  },
}));

const item = new StockItemUIModel(
  new StockDTO({
    description: "Leite",
    id: "stock-1",
    owner: StockOwners.USER,
    ownerId: "owner-1",
    quantity: 2,
    unit: StockUnits.LITER,
  }),
  [new OwnerDTO({ id: "owner-1", name: "Ana", type: OwnerType.USER })],
  new Date(),
);

const mutation = new UseMutationFixture<
  { id: string; ownerId: string },
  void
>();
let built = mutation.reset().build();
const onClose = jest.fn();
const onDeleted = jest.fn();

function rebuild(status: "error" | "idle" | "success", isFetching = false) {
  built = {
    ...mutation.reset().withStatus(status).withIsFetching(isFetching).build(),
    mutate: built.mutate,
  };
}

function setup() {
  jest.mocked(useMutation).mockImplementation(() => built as never);

  return renderHook(() =>
    useStockItemDetailsViewModel({ item, onClose, onDeleted }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  built = mutation.reset().build();
});

it("SHOULD open the confirm WHEN delete is pressed", () => {
  const { result } = setup();

  act(() => {
    result.current.onDeletePress();
  });

  expect(result.current.isConfirmOpen).toBe(true);
});

it("SHOULD close the confirm without mutating WHEN cancelled", () => {
  const { result } = setup();

  act(() => {
    result.current.onDeletePress();
  });
  act(() => {
    result.current.onCancelDelete();
  });

  expect(result.current.isConfirmOpen).toBe(false);
  expect(built.mutate).not.toHaveBeenCalled();
});

it("SHOULD delete the item once WHEN confirmed", () => {
  const { result } = setup();

  act(() => {
    result.current.onConfirmDelete();
  });

  expect(built.mutate).toHaveBeenCalledTimes(1);
  expect(built.mutate).toHaveBeenCalledWith({
    id: "stock-1",
    ownerId: "owner-1",
  });
});

it("SHOULD NOT delete again WHEN already deleting", () => {
  rebuild("idle", true);
  const { result } = setup();

  act(() => {
    result.current.onConfirmDelete();
  });

  expect(result.current.isDeleting).toBe(true);
  expect(built.mutate).not.toHaveBeenCalled();
});

it("SHOULD notify and close the confirm ONCE WHEN the deletion succeeds", () => {
  const { rerender, result } = setup();

  act(() => {
    result.current.onDeletePress();
  });
  rebuild("success");
  rerender({});

  expect(onDeleted).toHaveBeenCalledTimes(1);
  expect(result.current.isConfirmOpen).toBe(false);
});

it("SHOULD expose the error and retry WHEN the deletion fails", () => {
  const { rerender, result } = setup();

  act(() => {
    result.current.onDeletePress();
  });
  rebuild("error");
  rerender({});

  expect(result.current.errorKey).toBe("common.errors.generic");
  expect(result.current.isConfirmOpen).toBe(false);
  expect(onDeleted).not.toHaveBeenCalled();

  act(() => {
    result.current.onConfirmDelete();
  });

  expect(built.mutate).toHaveBeenCalledTimes(1);
});
