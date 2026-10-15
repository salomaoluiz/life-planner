import { act, renderHook } from "@tests";

import TransactionDTO from "@application/dto/financial/TransactionDTO";
import { GenericError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import TransactionUIModel from "../models/TransactionUIModel";
import useAdjustmentSheet from "./useAdjustmentSheet";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFinancialTransactionUseCase: {
      execute: jest.fn(),
      uniqueName: "delete-transaction",
    },
  },
}));

const item = new TransactionUIModel(
  new TransactionDTO({
    accountId: "acc-1",
    accountName: "Checking",
    category: "Balance adjustment",
    categoryId: "cat-1",
    date: new Date(2026, 9, 15).toISOString(),
    description: "Balance adjustment",
    excludeFromTotals: true,
    id: "adj-1",
    owner: "USER",
    ownerId: "user-id",
    systemKey: "BALANCE_ADJUSTMENT",
    type: "INCOME",
    value: "50.00",
  }),
);

let mutation = new UseMutationFixture<unknown, unknown>();
const onDeleted = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  mutation = new UseMutationFixture<unknown, unknown>();
  jest
    .mocked(useMutation)
    .mockImplementation((() => mutation.build()) as never);
});

function setup() {
  return renderHook(() => useAdjustmentSheet({ onDeleted }));
}

it("SHOULD be closed until an adjustment is opened, then close again", () => {
  const { result } = setup();
  expect(result.current.item).toBeUndefined();

  act(() => result.current.onOpen(item));
  expect(result.current.item).toBe(item);

  act(() => result.current.onClose());
  expect(result.current.item).toBeUndefined();
});

it("SHOULD delete the opened transaction with its id and owner id", () => {
  const { result } = setup();

  act(() => result.current.onOpen(item));
  act(() => result.current.onDelete());

  expect(mutation.value.mutate).toHaveBeenCalledWith({
    id: "adj-1",
    ownerId: "user-id",
  });
});

it("SHOULD do nothing WHEN deleting with no opened adjustment", () => {
  const { result } = setup();

  act(() => result.current.onDelete());

  expect(mutation.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD close the sheet AND ask the screen to refresh WHEN the delete succeeds", () => {
  mutation.withStatus("success");
  const { result } = setup();

  expect(onDeleted).toHaveBeenCalledTimes(1);
  expect(result.current.item).toBeUndefined();
});

it("SHOULD expose the error copy only after a delete attempt, and clear it when reopening", () => {
  mutation.withError(new GenericError());
  const { result } = setup();

  expect(result.current.errorKey).toBeUndefined();

  act(() => result.current.onOpen(item));
  act(() => result.current.onDelete());
  expect(result.current.errorKey).toBe("common.errors.generic");

  act(() => result.current.onClose());
  act(() => result.current.onOpen(item));
  expect(result.current.errorKey).toBeUndefined();
});
